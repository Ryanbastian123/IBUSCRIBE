"""
Async SQLAlchemy engine + session factory for Supabase (PostgreSQL).
"""
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# Supabase connection string from .env
# Format: postgresql+asyncpg://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")

# asyncpg driver — swap postgresql:// → postgresql+asyncpg://
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,   # auto-reconnect on dropped connections
    echo=False,           # set True to log all SQL (debug only)
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency — yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
