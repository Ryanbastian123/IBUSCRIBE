"""
Patient CRUD — all routes are protected (requires valid JWT).
Patients are scoped to the doctor's organisation (org_id).

GET    /api/v1/patients          — list all patients in org
POST   /api/v1/patients          — create new patient
GET    /api/v1/patients/{id}     — get single patient + encounter history
PATCH  /api/v1/patients/{id}     — update patient details
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.connection import get_db
from database.models import Doctor, Patient, Encounter
from services.auth import get_current_doctor

router = APIRouter(prefix="/patients", tags=["patients"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    full_name:          str
    age:                Optional[int]   = None
    sex:                Optional[str]   = None   # M / F / Other
    phone:              Optional[str]   = None
    email:              Optional[str]   = None
    address:            Optional[str]   = None
    blood_group:        Optional[str]   = None
    uhid:               Optional[str]   = None
    allergies:          list[str]       = []
    chronic_conditions: list[str]       = []


class PatientUpdate(BaseModel):
    full_name:          Optional[str]   = None
    age:                Optional[int]   = None
    sex:                Optional[str]   = None
    phone:              Optional[str]   = None
    email:              Optional[str]   = None
    address:            Optional[str]   = None
    blood_group:        Optional[str]   = None
    allergies:          Optional[list[str]] = None
    chronic_conditions: Optional[list[str]] = None


class PatientOut(BaseModel):
    id:                 str
    full_name:          str
    age:                Optional[int]
    sex:                Optional[str]
    phone:              Optional[str]
    blood_group:        Optional[str]
    uhid:               Optional[str]
    allergies:          list
    chronic_conditions: list
    visit_count:        int = 0

    model_config = {"from_attributes": True}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _assert_same_org(patient: Patient, doctor: Doctor):
    if patient.org_id != doctor.org_id:
        raise HTTPException(status_code=404, detail="Patient not found")


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[PatientOut])
async def list_patients(
    doctor: Doctor = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Patient)
        .where(Patient.org_id == doctor.org_id)
        .order_by(Patient.full_name)
    )
    patients = result.scalars().all()

    out = []
    for p in patients:
        enc_result = await db.execute(
            select(Encounter).where(Encounter.patient_id == p.id)
        )
        visit_count = len(enc_result.scalars().all())
        out.append(PatientOut(
            id=str(p.id),
            full_name=p.full_name,
            age=p.age,
            sex=p.sex,
            phone=p.phone,
            blood_group=p.blood_group,
            uhid=p.uhid,
            allergies=p.allergies or [],
            chronic_conditions=p.chronic_conditions or [],
            visit_count=visit_count,
        ))
    return out


@router.post("", response_model=PatientOut, status_code=201)
async def create_patient(
    body: PatientCreate,
    doctor: Doctor = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    patient = Patient(
        org_id=doctor.org_id,
        **body.model_dump(),
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return PatientOut(
        id=str(patient.id),
        full_name=patient.full_name,
        age=patient.age,
        sex=patient.sex,
        phone=patient.phone,
        blood_group=patient.blood_group,
        uhid=patient.uhid,
        allergies=patient.allergies or [],
        chronic_conditions=patient.chronic_conditions or [],
        visit_count=0,
    )


@router.get("/{patient_id}")
async def get_patient(
    patient_id: UUID,
    doctor: Doctor = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Patient)
        .options(selectinload(Patient.encounters))
        .where(Patient.id == patient_id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    _assert_same_org(patient, doctor)

    encounters_out = [
        {
            "id":           str(e.id),
            "created_at":   e.created_at.isoformat(),
            "status":       e.status,
            "clinical_data": e.clinical_data,
            "transcript":   e.transcript,
        }
        for e in (patient.encounters or [])
    ]

    return {
        "id":                 str(patient.id),
        "full_name":          patient.full_name,
        "age":                patient.age,
        "sex":                patient.sex,
        "phone":              patient.phone,
        "email":              patient.email,
        "address":            patient.address,
        "blood_group":        patient.blood_group,
        "uhid":               patient.uhid,
        "abha_id":            patient.abha_id,
        "allergies":          patient.allergies or [],
        "chronic_conditions": patient.chronic_conditions or [],
        "encounters":         encounters_out,
        "visit_count":        len(encounters_out),
    }


@router.patch("/{patient_id}", response_model=PatientOut)
async def update_patient(
    patient_id: UUID,
    body: PatientUpdate,
    doctor: Doctor = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    _assert_same_org(patient, doctor)

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(patient, field, value)

    await db.commit()
    await db.refresh(patient)

    enc_result = await db.execute(
        select(Encounter).where(Encounter.patient_id == patient.id)
    )
    visit_count = len(enc_result.scalars().all())

    return PatientOut(
        id=str(patient.id),
        full_name=patient.full_name,
        age=patient.age,
        sex=patient.sex,
        phone=patient.phone,
        blood_group=patient.blood_group,
        uhid=patient.uhid,
        allergies=patient.allergies or [],
        chronic_conditions=patient.chronic_conditions or [],
        visit_count=visit_count,
    )
