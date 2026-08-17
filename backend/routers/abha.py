"""
abha.py — ABDM ABHA v3 API integration
Milestone 1: ABHA enrollment (Aadhaar OTP) + ABHA login (mobile OTP)

Gateway:  https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions
ABHA v3:  https://abhasbx.abdm.gov.in/abha/api/v3/

Enrollment flow (new patient, no ABHA):
  POST /abha/enrollment/otp      → Send Aadhaar OTP
  POST /abha/enrollment/verify   → Verify OTP → create ABHA, get txnId
  POST /abha/enrollment/mobile   → Update mobile (optional)

Login flow (existing ABHA holder):
  POST /abha/login/otp           → Send OTP to ABHA-linked mobile
  POST /abha/login/verify        → Verify OTP → return ABHA profile
"""

import os
import uuid
import base64
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding

router = APIRouter()

# ── Config ────────────────────────────────────────────────────────────────────

ABDM_GATEWAY       = os.environ.get("ABDM_GATEWAY_URL", "https://dev.abdm.gov.in")
ABDM_CLIENT_ID     = os.environ.get("ABDM_CLIENT_ID", "")
ABDM_CLIENT_SECRET = os.environ.get("ABDM_CLIENT_SECRET", "")
ABHA_BASE          = "https://abhasbx.abdm.gov.in"

# ── Helpers ───────────────────────────────────────────────────────────────────

def _timestamp() -> str:
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')

def _request_id() -> str:
    return str(uuid.uuid4())

async def _get_gateway_token() -> str:
    """Fetch ABDM gateway v3 access token using client credentials."""
    if not ABDM_CLIENT_ID or not ABDM_CLIENT_SECRET:
        raise HTTPException(
            status_code=503,
            detail="ABDM credentials not configured. Set ABDM_CLIENT_ID and ABDM_CLIENT_SECRET in .env"
        )
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ABDM_GATEWAY}/api/hiecm/gateway/v3/sessions",
            headers={
                "Content-Type": "application/json",
                "REQUEST-ID": _request_id(),
                "TIMESTAMP": _timestamp(),
                "X-CM-ID": "sbx",
            },
            json={
                "clientId": ABDM_CLIENT_ID,
                "clientSecret": ABDM_CLIENT_SECRET,
                "grantType": "client_credentials",
            },
            timeout=15,
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"ABDM auth failed: {resp.text}")
        data = resp.json()
        return data.get("accessToken") or data.get("access_token", "")


def _headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "REQUEST-ID": _request_id(),
        "TIMESTAMP": _timestamp(),
    }


async def _get_public_key() -> str:
    """Fetch ABDM RSA public key for encrypting sensitive fields."""
    token = await _get_gateway_token()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{ABHA_BASE}/abha/api/v3/profile/public/certificate",
            headers=_headers(token),
            timeout=10,
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch ABDM public key")
        return resp.json()["publicKey"]


def _rsa_encrypt(public_key_b64: str, plain_text: str) -> str:
    """RSA-encrypt a value with ABDM's public key (PKCS1v15 padding)."""
    key_bytes = base64.b64decode(public_key_b64)
    public_key = serialization.load_der_public_key(key_bytes)
    encrypted = public_key.encrypt(plain_text.encode("utf-8"), asym_padding.PKCS1v15())
    return base64.b64encode(encrypted).decode("utf-8")


# ── Request models ────────────────────────────────────────────────────────────

class EnrollmentOtpRequest(BaseModel):
    aadhaar: str   # 12-digit Aadhaar number (will be RSA-encrypted before sending)

class EnrollmentVerifyRequest(BaseModel):
    txn_id: str    # Transaction ID from enrollment OTP step
    otp: str       # 6-digit OTP (will be RSA-encrypted)
    mobile: str    # 10-digit mobile for ABHA communication

class LoginOtpRequest(BaseModel):
    mobile: str    # 10-digit mobile number linked to ABHA

class LoginVerifyRequest(BaseModel):
    txn_id: str    # Transaction ID from login OTP step
    otp: str       # 6-digit OTP (will be RSA-encrypted)

class ABHAVerifyRequest(BaseModel):
    abha_id: str   # ABHA address (name@abdm) or 14-digit ABHA number

# ── Enrollment flow (new patient, no ABHA) ────────────────────────────────────

@router.post("/abha/enrollment/otp")
async def enrollment_send_otp(body: EnrollmentOtpRequest):
    """
    Step 1 of ABHA creation: send Aadhaar OTP to patient's Aadhaar-linked mobile.
    Returns txn_id for next step.
    """
    aadhaar = body.aadhaar.strip().replace(" ", "").replace("-", "")
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        raise HTTPException(status_code=400, detail="Aadhaar must be exactly 12 digits.")

    token = await _get_gateway_token()
    pub_key = await _get_public_key()
    enc_aadhaar = _rsa_encrypt(pub_key, aadhaar)

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ABHA_BASE}/abha/api/v3/enrollment/request/otp",
            headers=_headers(token),
            json={
                "txnId": "",
                "scope": ["abha-enrol"],
                "loginHint": "aadhaar",
                "loginId": enc_aadhaar,
                "otpSystem": "aadhaar",
            },
            timeout=15,
        )
        if resp.status_code == 200:
            data = resp.json()
            return {
                "success": True,
                "txn_id": data.get("txnId", ""),
                "message": "OTP sent to Aadhaar-linked mobile number.",
            }
        else:
            raise HTTPException(
                status_code=502,
                detail=f"ABDM OTP failed ({resp.status_code}): {resp.text}"
            )


@router.post("/abha/enrollment/verify")
async def enrollment_verify_otp(body: EnrollmentVerifyRequest):
    """
    Step 2 of ABHA creation: verify Aadhaar OTP → create ABHA.
    Returns ABHA number, ABHA address, name, gender, year of birth.
    """
    if len(body.otp) != 6 or not body.otp.isdigit():
        raise HTTPException(status_code=400, detail="OTP must be exactly 6 digits.")

    token = await _get_gateway_token()
    pub_key = await _get_public_key()
    enc_otp = _rsa_encrypt(pub_key, body.otp)

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ABHA_BASE}/abha/api/v3/enrollment/enrol/byAadhaar",
            headers=_headers(token),
            json={
                "authData": {
                    "authMethods": ["otp"],
                    "otp": {
                        "txnId": body.txn_id,
                        "otpValue": enc_otp,
                        "mobile": body.mobile,
                    },
                },
                "consent": {
                    "code": "abha-enrollment",
                    "version": "1.4",
                },
            },
            timeout=15,
        )
        if resp.status_code in (200, 201):
            data = resp.json()
            return {
                "success": True,
                "abha_number":   data.get("ABHANumber", ""),
                "abha_address":  data.get("preferredAbhaAddress", ""),
                "name":          data.get("name", ""),
                "gender":        data.get("gender", ""),
                "year_of_birth": data.get("yearOfBirth", ""),
                "mobile":        data.get("mobile", ""),
                "txn_id":        data.get("txnId", body.txn_id),
            }
        elif resp.status_code == 400:
            return {"success": False, "message": "Incorrect OTP. Please try again."}
        else:
            raise HTTPException(
                status_code=502,
                detail=f"ABHA creation failed ({resp.status_code}): {resp.text}"
            )


# ── Login flow (existing ABHA holder) ─────────────────────────────────────────

@router.post("/abha/login/otp")
async def login_send_otp(body: LoginOtpRequest):
    """
    Step 1 of ABHA login: send OTP to mobile linked with existing ABHA.
    Returns txn_id for verification step.
    """
    mobile = body.mobile.strip()
    if len(mobile) != 10 or not mobile.isdigit():
        raise HTTPException(status_code=400, detail="Mobile must be exactly 10 digits.")

    token = await _get_gateway_token()
    pub_key = await _get_public_key()
    enc_mobile = _rsa_encrypt(pub_key, mobile)

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ABHA_BASE}/abha/api/v3/profile/login/request/otp",
            headers=_headers(token),
            json={
                "scope": ["abha-login", "mobile-verify"],
                "loginHint": "mobile",
                "loginId": enc_mobile,
                "otpSystem": "abdm",
            },
            timeout=15,
        )
        if resp.status_code == 200:
            data = resp.json()
            return {
                "success": True,
                "txn_id": data.get("txnId", ""),
                "message": f"OTP sent to mobile ending ···{mobile[-4:]}",
            }
        else:
            raise HTTPException(
                status_code=502,
                detail=f"ABDM login OTP failed ({resp.status_code}): {resp.text}"
            )


@router.post("/abha/login/verify")
async def login_verify_otp(body: LoginVerifyRequest):
    """
    Step 2 of ABHA login: verify OTP → return ABHA profile.
    """
    if len(body.otp) != 6 or not body.otp.isdigit():
        raise HTTPException(status_code=400, detail="OTP must be exactly 6 digits.")

    token = await _get_gateway_token()
    pub_key = await _get_public_key()
    enc_otp = _rsa_encrypt(pub_key, body.otp)

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ABHA_BASE}/abha/api/v3/profile/login/verify",
            headers=_headers(token),
            json={
                "scope": ["abha-login", "mobile-verify"],
                "authData": {
                    "authMethods": ["otp"],
                    "otp": {
                        "txnId": body.txn_id,
                        "otpValue": enc_otp,
                    },
                },
            },
            timeout=15,
        )
        if resp.status_code == 200:
            data = resp.json()
            return {
                "success":       True,
                "abha_address":  data.get("ABHAAddress", ""),
                "abha_number":   data.get("ABHANumber", ""),
                "name":          data.get("name", ""),
                "gender":        data.get("gender", ""),
                "year_of_birth": data.get("yearOfBirth", ""),
                "mobile":        data.get("mobile", ""),
            }
        elif resp.status_code == 400:
            return {"success": False, "message": "Incorrect OTP. Please try again."}
        else:
            raise HTTPException(
                status_code=502,
                detail=f"ABHA login verify failed ({resp.status_code}): {resp.text}"
            )


# ── ABHA address search (verify existing ABHA) ────────────────────────────────

@router.post("/abha/verify")
async def verify_abha(body: ABHAVerifyRequest):
    """
    Quick check: does this ABHA address / 14-digit number exist and is it active?
    Used in patient intake to confirm ABHA before saving to IndexedDB.
    """
    token = await _get_gateway_token()
    pub_key = await _get_public_key()
    abha_id = body.abha_id.strip()
    enc_abha = _rsa_encrypt(pub_key, abha_id)

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ABHA_BASE}/abha/api/v3/profile/login/request/otp",
            headers=_headers(token),
            json={
                "scope": ["abha-login", "mobile-verify"],
                "loginHint": "abha-number" if abha_id.replace("-", "").isdigit() else "abha-address",
                "loginId": enc_abha,
                "otpSystem": "abdm",
            },
            timeout=15,
        )
        # If 200, ABHA exists and OTP was sent to registered mobile
        if resp.status_code == 200:
            data = resp.json()
            return {
                "exists": True,
                "txn_id": data.get("txnId", ""),
                "message": "ABHA found. OTP sent to linked mobile for verification.",
            }
        elif resp.status_code == 404:
            return {"exists": False, "message": "ABHA not found."}
        else:
            raise HTTPException(
                status_code=502,
                detail=f"ABHA lookup failed ({resp.status_code}): {resp.text}"
            )
