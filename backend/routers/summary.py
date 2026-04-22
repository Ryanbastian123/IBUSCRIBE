from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.patient_summary import (
    generate_patient_summary,
    generate_icd_codes,
    build_whatsapp_message,
)

router = APIRouter()


class SummaryRequest(BaseModel):
    clinical_data: dict          # full output from /api/v1/extract
    patient_name:  str = "there"
    language:      str = "en"    # en hi ta te kn bn ml mr


@router.post("/summary/generate")
async def generate_summary(req: SummaryRequest):
    """
    Generate a patient-friendly summary from a clinical note.

    Pass the full JSON from POST /api/v1/extract as `clinical_data`.
    Returns structured summary + validated ICD-10 codes.
    """
    try:
        # 1. Validate / enrich ICD-10 codes via WHO API (or Groq fallback)
        icd_codes = await generate_icd_codes(req.clinical_data)

        # 2. Build patient-friendly summary
        summary = await generate_patient_summary(
            clinical_data=req.clinical_data,
            patient_name=req.patient_name,
            language=req.language,
        )

        return {
            "summary":   summary,
            "icd_codes": icd_codes,
        }

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Summary generation failed: {str(e)}")


@router.post("/summary/whatsapp")
async def generate_whatsapp(req: SummaryRequest):
    """
    Generate a WhatsApp-ready plain-text message.

    Same input as /summary/generate.
    Returns a formatted string ready to send via Twilio / WhatsApp Business API.
    """
    try:
        summary = await generate_patient_summary(
            clinical_data=req.clinical_data,
            patient_name=req.patient_name,
            language=req.language,
        )
        message = build_whatsapp_message(summary)

        return {
            "message":    message,
            "language":   req.language,
            "char_count": len(message),
        }

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"WhatsApp message failed: {str(e)}")
