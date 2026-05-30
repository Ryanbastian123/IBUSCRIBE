"""
Patient CRUD — all routes require valid JWT.
Patients are scoped to the doctor's organisation.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Doctor, Patient, Encounter
from services.auth import get_current_doctor

router = APIRouter(prefix="/patients", tags=["patients"])


class PatientCreate(BaseModel):
    full_name:          str
    age:                Optional[int]   = None
    sex:                Optional[str]   = None
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


def _assert_same_org(patient: Patient, doctor: Doctor):
    if patient.org_id != doctor.org_id:
        raise HTTPException(status_code=404, detail="Patient not found")


@router.get("", response_model=list[PatientOut])
def list_patients(
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    patients = db.query(Patient).filter(Patient.org_id == doctor.org_id).order_by(Patient.full_name).all()
    out = []
    for p in patients:
        visit_count = db.query(Encounter).filter(Encounter.patient_id == p.id).count()
        out.append(PatientOut(
            id=str(p.id), full_name=p.full_name, age=p.age, sex=p.sex,
            phone=p.phone, blood_group=p.blood_group, uhid=p.uhid,
            allergies=p.allergies or [], chronic_conditions=p.chronic_conditions or [],
            visit_count=visit_count,
        ))
    return out


@router.post("", response_model=PatientOut, status_code=201)
def create_patient(
    body: PatientCreate,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    patient = Patient(org_id=doctor.org_id, **body.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return PatientOut(
        id=str(patient.id), full_name=patient.full_name, age=patient.age,
        sex=patient.sex, phone=patient.phone, blood_group=patient.blood_group,
        uhid=patient.uhid, allergies=patient.allergies or [],
        chronic_conditions=patient.chronic_conditions or [], visit_count=0,
    )


@router.get("/{patient_id}")
def get_patient(
    patient_id: UUID,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    _assert_same_org(patient, doctor)

    encounters = db.query(Encounter).filter(Encounter.patient_id == patient.id).order_by(Encounter.created_at.desc()).all()
    return {
        "id": str(patient.id), "full_name": patient.full_name, "age": patient.age,
        "sex": patient.sex, "phone": patient.phone, "email": patient.email,
        "address": patient.address, "blood_group": patient.blood_group,
        "uhid": patient.uhid, "abha_id": patient.abha_id,
        "allergies": patient.allergies or [], "chronic_conditions": patient.chronic_conditions or [],
        "encounters": [{"id": str(e.id), "created_at": e.created_at.isoformat(),
                        "status": e.status, "clinical_data": e.clinical_data} for e in encounters],
        "visit_count": len(encounters),
    }


@router.patch("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: UUID,
    body: PatientUpdate,
    doctor: Doctor = Depends(get_current_doctor),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    _assert_same_org(patient, doctor)

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)

    visit_count = db.query(Encounter).filter(Encounter.patient_id == patient.id).count()
    return PatientOut(
        id=str(patient.id), full_name=patient.full_name, age=patient.age,
        sex=patient.sex, phone=patient.phone, blood_group=patient.blood_group,
        uhid=patient.uhid, allergies=patient.allergies or [],
        chronic_conditions=patient.chronic_conditions or [], visit_count=visit_count,
    )
