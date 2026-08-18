import base64
import uuid
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Doctor, Patient, Encounter
from services.auth import get_current_doctor
from services.whisper_stt import transcribe_audio
from services.clinical_llm import extract_clinical_data
from services.fhir_builder import build_fhir_bundle
from services.snomed import get_snomed_for_diagnosis

router = APIRouter()


class EncounterRequest(BaseModel):
    audio_b64: str
    language: str = "mixed"
    patient_name: str = ""
    patient_age: str = ""
    patient_gender: str = ""
    abha_id: str = ""
    chief_complaint: Optional[str] = None
    symptom_duration: Optional[str] = None
    symptom_severity: Optional[str] = None
    symptoms_detail: Optional[str] = None
    current_medications: Optional[str] = None
    known_allergies: Optional[str] = None
    past_history: Optional[str] = None


class ApproveRequest(BaseModel):
    doctor_notes: Optional[str] = None
    clinical_data: Optional[dict] = None  # doctor-edited version


def _find_or_create_patient(
    db: Session,
    doctor: Doctor,
    name: str,
    age: str,
    gender: str,
    abha_id: str,
) -> Patient:
    """Look up patient by name within the org; create if not found."""
    patient = (
        db.query(Patient)
        .filter(Patient.org_id == doctor.org_id, Patient.full_name == name)
        .first()
    )
    if patient:
        return patient

    sex_map = {"male": "M", "female": "F", "other": "Other", "M": "M", "F": "F"}
    sex = sex_map.get(gender, None) if gender else None

    age_int = None
    if age:
        try:
            age_int = int("".join(filter(str.isdigit, age))) or None
        except Exception:
            pass

    patient = Patient(
        org_id=doctor.org_id,
        full_name=name or "Unknown",
        age=age_int,
        sex=sex,
        abha_id=abha_id or None,
    )
    db.add(patient)
    db.flush()
    return patient


@router.post("/encounter")
async def create_encounter(
    body: EncounterRequest,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """
    Full pipeline: audio → transcript → clinical JSON → FHIR R4 bundle.
    Saves the encounter as 'draft' in the database and returns the DB ID.
    """
    try:
        audio_bytes = base64.b64decode(body.audio_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 audio data")

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio data is empty")

    # Step 1: Transcribe
    try:
        stt_result = await transcribe_audio(audio_bytes, "audio.webm", body.language)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Transcription failed: {str(e)}")

    transcript = stt_result["transcript"]
    if not transcript.strip():
        raise HTTPException(status_code=422, detail="Transcription produced empty output")

    # Step 2: Build intake context
    intake = {
        "chief_complaint": body.chief_complaint,
        "symptom_duration": body.symptom_duration,
        "symptom_severity": body.symptom_severity,
        "symptoms_detail": body.symptoms_detail,
        "current_medications": body.current_medications,
        "known_allergies": body.known_allergies,
        "past_history": body.past_history,
    }

    # Step 3: Extract clinical data
    try:
        clinical_data = await extract_clinical_data(transcript, intake)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"LLM returned invalid JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Clinical extraction failed: {str(e)}")

    # Step 3.5: Enrich with SNOMED codes
    for dx in clinical_data.get("diagnoses", []):
        snomed = await get_snomed_for_diagnosis(dx.get("description", ""))
        if snomed:
            dx["snomed_code"] = snomed["code"]
            dx["snomed_display"] = snomed["display"]

    # Step 4: Build FHIR bundle
    patient_meta = {
        "name": body.patient_name,
        "age": body.patient_age,
        "gender": body.patient_gender,
        "abha_id": body.abha_id,
    }
    encounter_id = str(uuid.uuid4())
    fhir_bundle = build_fhir_bundle(clinical_data, encounter_id, patient_meta)

    # Step 5: Persist to DB
    patient = _find_or_create_patient(
        db, doctor,
        name=body.patient_name,
        age=body.patient_age,
        gender=body.patient_gender,
        abha_id=body.abha_id,
    )

    encounter = Encounter(
        id=uuid.UUID(encounter_id),
        org_id=doctor.org_id,
        doctor_id=doctor.id,
        patient_id=patient.id,
        transcript=transcript,
        clinical_data=clinical_data,
        fhir_bundle=fhir_bundle,
        status="draft",
        language=body.language,
    )
    db.add(encounter)
    db.commit()

    return {
        "encounter_id": encounter_id,
        "patient_id": str(patient.id),
        "patient": patient_meta,
        "clinical_data": clinical_data,
        "fhir_bundle": fhir_bundle,
    }


@router.patch("/encounters/{encounter_id}/approve")
def approve_encounter(
    encounter_id: UUID,
    body: ApproveRequest,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """Doctor approves the reviewed note. Optionally saves edited clinical data."""
    encounter = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    if encounter.org_id != doctor.org_id:
        raise HTTPException(status_code=403, detail="Not your encounter")

    encounter.status = "approved"
    encounter.approved_at = datetime.now(timezone.utc)
    if body.doctor_notes:
        encounter.doctor_notes = body.doctor_notes
    if body.clinical_data:
        encounter.clinical_data = body.clinical_data

    db.commit()
    return {"status": "approved", "encounter_id": str(encounter_id)}


@router.get("/encounters")
def list_encounters(
    limit: int = 50,
    offset: int = 0,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    """List approved encounters for the doctor's clinic, newest first."""
    rows = (
        db.query(Encounter)
        .filter(Encounter.org_id == doctor.org_id)
        .order_by(Encounter.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    results = []
    for e in rows:
        patient = db.query(Patient).filter(Patient.id == e.patient_id).first()
        results.append({
            "encounter_id": str(e.id),
            "patient_id": str(e.patient_id),
            "patient_name": patient.full_name if patient else "Unknown",
            "patient_age": patient.age if patient else None,
            "patient_sex": patient.sex if patient else None,
            "status": e.status,
            "created_at": e.created_at.isoformat(),
            "approved_at": e.approved_at.isoformat() if e.approved_at else None,
            "chief_complaint": (e.clinical_data or {}).get("chief_complaint", ""),
            "diagnoses": [
                d.get("description", "") for d in (e.clinical_data or {}).get("diagnoses", [])
            ],
        })

    return {"encounters": results, "total": len(results), "offset": offset}
