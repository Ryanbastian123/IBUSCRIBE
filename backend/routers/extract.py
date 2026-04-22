from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.clinical_llm import extract_clinical_data

router = APIRouter()


class ExtractRequest(BaseModel):
    transcript: str


@router.post("/extract")
async def extract(body: ExtractRequest):
    """
    Extract structured clinical entities from a consultation transcript.

    Returns the full clinicalData JSON object matching the frontend's expected shape.
    """
    if not body.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript is empty")

    try:
        clinical_data = await extract_clinical_data(body.transcript)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Extraction failed: {str(e)}")

    return clinical_data
