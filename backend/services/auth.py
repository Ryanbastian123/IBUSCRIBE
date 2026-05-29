"""
JWT authentication helpers for MedScribe Phase 2.

- Password hashing with bcrypt
- JWT access tokens (30-minute expiry)
- get_current_doctor() dependency for protected routes
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.connection import get_db
from database.models import Doctor

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "CHANGE_ME_IN_PRODUCTION_USE_LONG_RANDOM_STRING")
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 7  # 7 days — long enough for daily clinical use

# ── Password hashing ─────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ── JWT token ─────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ── Bearer extractor ──────────────────────────────────────────────────────────
bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_doctor(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Doctor:
    """
    FastAPI dependency. Usage:

        @router.get("/patients")
        async def list_patients(doctor: Doctor = Depends(get_current_doctor)):
            ...
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(credentials.credentials)
    doctor_id: str = payload.get("sub")
    if not doctor_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    result = await db.execute(select(Doctor).where(Doctor.id == doctor_id))
    doctor = result.scalar_one_or_none()

    if not doctor or not doctor.is_active:
        raise HTTPException(status_code=401, detail="Doctor not found or inactive")

    return doctor
