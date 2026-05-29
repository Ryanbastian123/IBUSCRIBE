"""
SQLAlchemy ORM models for MedScribe Phase 2.

Tables:
  organisations  — clinics / hospitals (multi-doctor support)
  doctors        — authenticated users (linked to one org)
  patients       — patient records (owned by org)
  encounters     — consultations (audio → FHIR note)
  documents      — uploaded lab reports / discharge summaries
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer,
    String, Text, JSON, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.connection import Base


def _now():
    return datetime.now(timezone.utc)


# ─────────────────────────────────────────────────────────────────────────────
# Organisation  (clinic / hospital)
# ─────────────────────────────────────────────────────────────────────────────
class Organisation(Base):
    __tablename__ = "organisations"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String(255), nullable=False)
    city       = Column(String(100))
    state      = Column(String(100))
    phone      = Column(String(20))
    email      = Column(String(255))
    gstin      = Column(String(15))          # GST number
    created_at = Column(DateTime(timezone=True), default=_now)
    is_active  = Column(Boolean, default=True)

    # relationships
    doctors  = relationship("Doctor",  back_populates="organisation")
    patients = relationship("Patient", back_populates="organisation")


# ─────────────────────────────────────────────────────────────────────────────
# Doctor  (authenticated user = the physician)
# ─────────────────────────────────────────────────────────────────────────────
class Doctor(Base):
    __tablename__ = "doctors"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id          = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=False)
    full_name       = Column(String(255), nullable=False)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    specialisation  = Column(String(100))       # e.g. "General Physician"
    registration_no = Column(String(50))        # MCI / state council reg number
    phone           = Column(String(20))
    role            = Column(
        SAEnum("owner", "doctor", "admin", name="doctor_role"),
        default="doctor",
        nullable=False
    )
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), default=_now)
    last_login      = Column(DateTime(timezone=True), nullable=True)

    # relationships
    organisation = relationship("Organisation", back_populates="doctors")
    encounters   = relationship("Encounter", back_populates="doctor")


# ─────────────────────────────────────────────────────────────────────────────
# Patient
# ─────────────────────────────────────────────────────────────────────────────
class Patient(Base):
    __tablename__ = "patients"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id      = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=False)
    uhid        = Column(String(50))            # clinic-assigned unique health ID
    full_name   = Column(String(255), nullable=False)
    age         = Column(Integer)
    sex         = Column(SAEnum("M", "F", "Other", name="patient_sex"))
    phone       = Column(String(20))
    email       = Column(String(255))
    address     = Column(Text)
    blood_group = Column(String(5))
    abha_id     = Column(String(50))            # ABDM Health ID (Phase 3)
    allergies   = Column(JSON, default=list)    # ["Penicillin", ...]
    chronic_conditions = Column(JSON, default=list)
    created_at  = Column(DateTime(timezone=True), default=_now)
    updated_at  = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    # relationships
    organisation = relationship("Organisation", back_populates="patients")
    encounters   = relationship("Encounter", back_populates="patient",
                                order_by="desc(Encounter.created_at)")
    documents    = relationship("Document", back_populates="patient")


# ─────────────────────────────────────────────────────────────────────────────
# Encounter  (single consultation)
# ─────────────────────────────────────────────────────────────────────────────
class Encounter(Base):
    __tablename__ = "encounters"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id          = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=False, index=True)
    doctor_id       = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False, index=True)
    patient_id      = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)

    # raw pipeline outputs
    transcript      = Column(Text)
    clinical_data   = Column(JSON)              # extracted structured data
    fhir_bundle     = Column(JSON)              # FHIR R4 bundle

    # review state
    status          = Column(
        SAEnum("draft", "reviewed", "approved", "pushed", name="encounter_status"),
        default="draft",
        nullable=False
    )
    doctor_notes    = Column(Text)              # doctor's manual corrections
    approved_at     = Column(DateTime(timezone=True), nullable=True)

    # audio metadata
    audio_duration_sec = Column(Integer)
    language           = Column(String(10), default="en")

    created_at = Column(DateTime(timezone=True), default=_now)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now)

    # relationships
    doctor  = relationship("Doctor",  back_populates="encounters")
    patient = relationship("Patient", back_populates="encounters")


# ─────────────────────────────────────────────────────────────────────────────
# Document  (uploaded lab report / discharge summary)
# ─────────────────────────────────────────────────────────────────────────────
class Document(Base):
    __tablename__ = "documents"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id       = Column(UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=False)
    patient_id   = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=True)
    uploaded_by  = Column(UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=False)

    filename     = Column(String(255))
    file_type    = Column(String(10))           # pdf / docx
    analysis     = Column(JSON)                 # LLM analysis result
    created_at   = Column(DateTime(timezone=True), default=_now)

    # relationships
    patient = relationship("Patient", back_populates="documents")
