import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config, pool
from dotenv import load_dotenv
from alembic import context

# ── Make sure backend/ is on the path ────────────────────────────────────────
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Load .env so DATABASE_URL is available
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# ── Alembic config ────────────────────────────────────────────────────────────
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Import models so autogenerate can detect them ─────────────────────────────
from database.models import Base          # noqa: E402
from database import models               # noqa: F401  (ensure all models are imported)

target_metadata = Base.metadata

# ── Use DATABASE_URL from env (sync driver for Alembic) ───────────────────────
db_url = os.environ.get("DATABASE_URL", "")
# Alembic uses sync psycopg2/asyncpg — swap asyncpg back to regular postgres
if db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://", 1)

config.set_main_option("sqlalchemy.url", db_url)


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
