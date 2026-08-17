"""
SQLAlchemy engine + session factory for Supabase (PostgreSQL).
Uses psycopg2 (sync driver) wrapped in async-compatible sessions
so FastAPI endpoints stay async.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session

# Supabase connection string from .env
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")

# Render provides postgres:// — SQLAlchemy 2.0 requires postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Strip asyncpg driver if present
if "asyncpg" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)

_is_sqlite = DATABASE_URL.startswith("sqlite")

_engine_kwargs = (
    {"connect_args": {"check_same_thread": False}}
    if _is_sqlite else
    {"pool_size": 5, "max_overflow": 10, "pool_pre_ping": True, "connect_args": {"sslmode": "require"}}
)

engine = create_engine(DATABASE_URL, **_engine_kwargs)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
