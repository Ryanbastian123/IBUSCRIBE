"""
Authentication endpoints.

POST /api/v1/auth/register   — create org + first doctor (clinic onboarding)
POST /api/v1/auth/login      — email + password → JWT
GET  /api/v1/auth/me         — return current doctor profile
POST /api/v1/auth/invite     — owner invites another doctor to same org
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from database.models import Doctor, Organisation
from services.auth import (
    hash_password, verify_password,
    create_access_token, get_current_doctor,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    # Clinic info
    clinic_name:   str
    clinic_city:   str = ""
    clinic_state:  str = ""

    # Doctor info
    full_name:       str
    email:           EmailStr
    password:        str
    specialisation:  str = "General Physician"
    registration_no: str = ""
    phone:           str = ""


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class InviteRequest(BaseModel):
    full_name:       str
    email:           EmailStr
    password:        str
    specialisation:  str = "General Physician"
    registration_no: str = ""
    phone:           str = ""
    role:            str = "doctor"


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    doctor_id:    str
    org_id:       str
    full_name:    str
    role:         str


class DoctorProfile(BaseModel):
    id:             str
    org_id:         str
    full_name:      str
    email:          str
    specialisation: str | None
    role:           str
    clinic_name:    str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Onboard a new clinic.
    Creates: Organisation + first Doctor (role=owner).
    """
    # Prevent duplicate email
    existing = await db.execute(select(Doctor).where(Doctor.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create organisation
    org = Organisation(
        name=body.clinic_name,
        city=body.clinic_city,
        state=body.clinic_state,
    )
    db.add(org)
    await db.flush()  # get org.id before creating doctor

    # Create owner doctor
    doctor = Doctor(
        org_id=org.id,
        full_name=body.full_name,
        email=body.email,
        hashed_password=hash_password(body.password),
        specialisation=body.specialisation,
        registration_no=body.registration_no,
        phone=body.phone,
        role="owner",
    )
    db.add(doctor)
    await db.commit()
    await db.refresh(doctor)

    token = create_access_token({"sub": str(doctor.id), "org": str(org.id)})
    return TokenResponse(
        access_token=token,
        doctor_id=str(doctor.id),
        org_id=str(org.id),
        full_name=doctor.full_name,
        role=doctor.role,
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Doctor).where(Doctor.email == body.email))
    doctor = result.scalar_one_or_none()

    if not doctor or not verify_password(body.password, doctor.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not doctor.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    # Update last_login
    doctor.last_login = datetime.now(timezone.utc)
    await db.commit()

    token = create_access_token({"sub": str(doctor.id), "org": str(doctor.org_id)})
    return TokenResponse(
        access_token=token,
        doctor_id=str(doctor.id),
        org_id=str(doctor.org_id),
        full_name=doctor.full_name,
        role=doctor.role,
    )


@router.get("/me", response_model=DoctorProfile)
async def me(
    doctor: Doctor = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Organisation).where(Organisation.id == doctor.org_id)
    )
    org = result.scalar_one_or_none()

    return DoctorProfile(
        id=str(doctor.id),
        org_id=str(doctor.org_id),
        full_name=doctor.full_name,
        email=doctor.email,
        specialisation=doctor.specialisation,
        role=doctor.role,
        clinic_name=org.name if org else "",
    )


@router.post("/invite", response_model=TokenResponse, status_code=201)
async def invite_doctor(
    body: InviteRequest,
    current_doctor: Doctor = Depends(get_current_doctor),
    db: AsyncSession = Depends(get_db),
):
    """
    Owner invites another doctor to their organisation.
    Only owners can call this endpoint.
    """
    if current_doctor.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners can invite doctors")

    existing = await db.execute(select(Doctor).where(Doctor.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    doctor = Doctor(
        org_id=current_doctor.org_id,
        full_name=body.full_name,
        email=body.email,
        hashed_password=hash_password(body.password),
        specialisation=body.specialisation,
        registration_no=body.registration_no,
        phone=body.phone,
        role=body.role,
    )
    db.add(doctor)
    await db.commit()
    await db.refresh(doctor)

    token = create_access_token({"sub": str(doctor.id), "org": str(doctor.org_id)})
    return TokenResponse(
        access_token=token,
        doctor_id=str(doctor.id),
        org_id=str(doctor.org_id),
        full_name=doctor.full_name,
        role=doctor.role,
    )
