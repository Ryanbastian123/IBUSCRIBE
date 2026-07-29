"""
abha.py — ABDM ABHA (Ayushman Bharat Health Account) API integration
Milestone 1: ABHA verification + creation via mobile OTP

Endpoints:
  POST /api/v1/abha/verify         — check if an ABHA address/number is valid
  POST /api/v1/abha/generate-otp   — send OTP to patient mobile for ABHA creation
  POST /api/v1/abha/verify-otp     — confirm OTP and return ABHA details
"""

import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# ── Config ───────────────────────────────────────────────────────────────────

ABDM_GATEWAY       = os.environ.get("ABDM_GATEWAY_URL", "https://dev.abdm.gov.in")
ABDM_CLIENT_ID     = os.environ.get("ABDM_CLIENT_ID", "")
ABDM_CLIENT_SECRET = os.environ.get("ABDM_CLIENT_SECRET", "")

# ABHA Health ID service — sandbox base URL
ABHA_BASE = "https://healthidsbx.abdm.gov.in"

# ── Helpers ──────────────────────────────────────────────────────────────────

async def _get_gateway_token() -> str:
    """Fetch ABDM gateway access token using sandbox client credentials."""
    if not ABDM_CLIENT_ID or not ABDM_CLIENT_SECRET:
        raise HTTPException(
            status_code=503,
            detail="ABDM credentials not configured. Set ABDM_CLIENT_ID and ABDM_CLIENT_SECRET in .env"
        )
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ABDM_GATEWAY}/gateway/v0.5/sessions",
            json={"clientId": ABDM_CLIENT_ID, "clientSecret": ABDM_CLIENT_SECRET},
            timeout=10,
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"ABDM auth failed: {resp.text}")
        return resp.json()["accessToken"]


def _headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

# ── Request models ────────────────────────────────────────────────────────────

class ABHAVerifyRequest(BaseModel):
    abha_id: str   # ABHA address (name@abdm) or 14-digit ABHA number

class ABHAOtpRequest(BaseModel):
    mobile: str    # 10-digit mobile number

class ABHAOtpVerifyRequest(BaseModel):
    txn_id: str    # Transaction ID returned by generate-otp
    otp: str       # 6-digit OTP entered by doctor/patient

# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/abha/verify")
async def verify_abha(body: ABHAVerifyRequest):
    """
    Verify if an ABHA address (xyz@abdm) or 14-digit ABHA number is valid and active.
    Returns patient name, year of birth, gender from the ABHA registry.
    Used in the patient intake form to confirm the ABHA before saving.
    """
    token = await _get_gateway_token()
    abha_id = body.abha_id.strip()

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{ABHA_BASE}/api/v1/search/existsByHealthId",
            params={"healthId": abha_id},
            headers=_headers(token),
            timeout=10,
        )

        if resp.status_code == 200:
            data = resp.json()
            return {
                "verified": True,
                "abha_id":       data.get("healthId", abha_id),
                "name":          data.get("name", ""),
                "year_of_birth": data.get("yearOfBirth", ""),
                "gender":        data.get("gender", ""),
                "mobile":        data.get("mobile", ""),
            }

        elif resp.status_code == 404:
            return {
                "verified": False,
                "message": "ABHA ID not found. Please check the ID and try again.",
            }

        else:
            raise HTTPException(
                status_code=502,
                detail=f"ABHA lookup failed (status {resp.status_code}): {resp.text}"
            )


@router.post("/abha/generate-otp")
async def generate_abha_otp(body: ABHAOtpRequest):
    """
    Send an OTP to the patient's mobile number to begin ABHA creation/login.
    Used when a patient does not already have an ABHA.
    Returns a txn_id that must be passed to verify-otp.
    """
    token = await _get_gateway_token()
    mobile = body.mobile.strip()

    if len(mobile) != 10 or not mobile.isdigit():
        raise HTTPException(status_code=400, detail="Mobile number must be exactly 10 digits.")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ABHA_BASE}/api/v1/registration/mobile/login/generateOtp",
            json={"mobile": mobile},
            headers=_headers(token),
            timeout=10,
        )

        if resp.status_code == 200:
            data = resp.json()
            return {
                "success": True,
                "txn_id": data.get("txnId", ""),
                "message": f"OTP sent to mobile number ending in ···{mobile[-4:]}",
            }

        else:
            raise HTTPException(
                status_code=502,
                detail=f"OTP generation failed (status {resp.status_code}): {resp.text}"
            )


@router.post("/abha/verify-otp")
async def verify_abha_otp(body: ABHAOtpVerifyRequest):
    """
    Confirm the OTP entered by the patient and retrieve their ABHA profile.
    Returns the ABHA address, 14-digit number, name, gender, year of birth.
    These are saved to the patient record in IndexedDB on the frontend.
    """
    token = await _get_gateway_token()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{ABHA_BASE}/api/v1/registration/mobile/login/verifyOtp",
            json={"txnId": body.txn_id, "otp": body.otp},
            headers=_headers(token),
            timeout=10,
        )

        if resp.status_code == 200:
            data = resp.json()
            return {
                "success":       True,
                "abha_id":       data.get("healthId", ""),       # e.g. name@abdm
                "abha_number":   data.get("healthIdNumber", ""), # 14-digit
                "name":          data.get("name", ""),
                "year_of_birth": data.get("yearOfBirth", ""),
                "gender":        data.get("gender", ""),
                "mobile":        data.get("mobile", ""),
            }

        elif resp.status_code == 400:
            return {
                "success": False,
                "message": "Incorrect OTP. Please try again.",
            }

        else:
            raise HTTPException(
                status_code=502,
                detail=f"OTP verification failed (status {resp.status_code}): {resp.text}"
            )
