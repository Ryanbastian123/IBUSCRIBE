import os
import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

router = APIRouter()

ABDM_GATEWAY = os.environ.get("ABDM_GATEWAY_URL", "https://dev.abdm.gov.in")
ABDM_CLIENT_ID = os.environ.get("ABDM_CLIENT_ID", "")
ABDM_CLIENT_SECRET = os.environ.get("ABDM_CLIENT_SECRET", "")


class ABDMUploadRequest(BaseModel):
    encounter_id: str
    fhir_bundle: Any
    patient_name: str = ""
    abha_id: str = ""


async def _get_abdm_token() -> str:
    """Fetch ABDM gateway access token using client credentials."""
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


@router.post("/upload-abdm")
async def upload_to_abdm(body: ABDMUploadRequest):
    """
    Upload FHIR R4 bundle to ABDM HIE (Ayushman Bharat Digital Mission).

    Phase 1: Validates the bundle and returns a preview (ABDM credentials not yet configured).
    Phase 3: Full push to HIE-CM with ABHA-linked consent.
    """
    if not ABDM_CLIENT_ID or not ABDM_CLIENT_SECRET:
        # Phase 1 — credentials not set up yet, return a simulation response
        return {
            "status": "pending_credentials",
            "message": "ABDM credentials not yet configured. The proforma is ready for upload once ABDM HIP registration is complete.",
            "encounter_id": body.encounter_id,
            "fhir_resource_count": len(body.fhir_bundle.get("entry", [])) if isinstance(body.fhir_bundle, dict) else 0,
            "abdm_endpoint": f"{ABDM_GATEWAY}/hiecm/api/v0.5/health-information/hip/on-request",
            "abha_id": body.abha_id or "Not provided",
            "next_steps": [
                "Register as HIP (Health Information Provider) at https://dev.abdm.gov.in",
                "Obtain ABDM_CLIENT_ID and ABDM_CLIENT_SECRET",
                "Add credentials to backend/.env",
                "Patient must link their ABHA ID for consent-based push",
            ],
        }

    # Phase 3 — full ABDM push
    try:
        token = await _get_abdm_token()
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{ABDM_GATEWAY}/hiecm/api/v0.5/health-information/hip/on-request",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/fhir+json",
                    "X-CM-ID": "sbx",
                },
                json=body.fhir_bundle,
                timeout=15,
            )
            if resp.status_code not in (200, 202):
                raise HTTPException(status_code=502, detail=f"ABDM upload failed: {resp.text}")

            return {
                "status": "uploaded",
                "encounter_id": body.encounter_id,
                "abdm_response": resp.json(),
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ABDM upload error: {str(e)}")
