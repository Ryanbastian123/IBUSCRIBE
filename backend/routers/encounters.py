import base64
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.whisper_stt import transcribe_audio
from services.clinical_llm import extract_clinical_data
from services.fhir_builder import build_fhir_bundle

router = APIRouter()


class EncounterRequest(BaseModel):
    audio_b64: str
    language: str = "mixed"
    # Patient identity
    patient_name: str = ""
    patient_age: str = ""
    patient_gender: str = ""
    abha_id: str = ""
    # Patient intake (self-reported before consultation)
    chief_complaint: Optional[str] = None
    symptom_duration: Optional[str] = None
    symptom_severity: Optional[str] = None
    symptoms_detail: Optional[str] = None
    current_medications: Optional[str] = None
    known_allergies: Optional[str] = None
    past_history: Optional[str] = None


@router.post("/encounter")
async def create_encounter(body: EncounterRequest):
    """
    Full pipeline: patient intake + base64 audio → transcript → clinical JSON → FHIR R4 bundle.
    """
    try:
        audio_bytes = base64.b64decode(body.audio_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 audio data")

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio data is empty")

    encounter_id = str(uuid.uuid4())

    # Step 1: Transcribe
    try:
        stt_result = await transcribe_audio(audio_bytes, "audio.webm", body.language)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Transcription failed: {str(e)}")

    transcript = stt_result["transcript"]
    if not transcript.strip():
        raise HTTPException(status_code=422, detail="Transcription produced empty output")

    # Step 2: Build patient intake context from form data
    intake = {
        "chief_complaint": body.chief_complaint,
        "symptom_duration": body.symptom_duration,
        "symptom_severity": body.symptom_severity,
        "symptoms_detail": body.symptoms_detail,
        "current_medications": body.current_medications,
        "known_allergies": body.known_allergies,
        "past_history": body.past_history,
    }

    # Step 3: Extract clinical data using both sources
    try:
        clinical_data = await extract_clinical_data(transcript, intake)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Clinical extraction failed: {str(e)}")

    # Step 4: Build FHIR bundle
    patient = {
        "name": body.patient_name,
        "age": body.patient_age,
        "gender": body.patient_gender,
        "abha_id": body.abha_id,
    }
    fhir_bundle = build_fhir_bundle(clinical_data, encounter_id, patient)

    return {
        "encounter_id": encounter_id,
        "patient": patient,
        "clinical_data": clinical_data,
        "fhir_bundle": fhir_bundle,
    }
