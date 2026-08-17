from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import transcribe, extract, encounters, intake, abdm, summary, documents
from routers import auth, patients, abha, hip
from database.connection import engine, Base
import database.models  # noqa: register all ORM models before create_all

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    # Tables/types may already exist on PostgreSQL — non-fatal
    print(f"[startup] create_all warning: {e}")

app = FastAPI(
    title="ibuscribe",
    description="Ambient AI clinical documentation for Indian primary care",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://ibuscribe.com",
        "https://www.ibuscribe.com",
        "https://ibuscribe.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Phase 1 routers (unchanged) ───────────────────────────────────────────────
app.include_router(transcribe.router, prefix="/api/v1")
app.include_router(extract.router,    prefix="/api/v1")
app.include_router(encounters.router, prefix="/api/v1")
app.include_router(intake.router,     prefix="/api/v1")
app.include_router(abdm.router,       prefix="/api/v1")
app.include_router(summary.router,    prefix="/api/v1")
app.include_router(documents.router,  prefix="/api/v1")

# ── Phase 2 routers ───────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(abha.router,     prefix="/api/v1")

# ── M2: HIP callbacks (no prefix — ABDM calls /v0.5/* directly) ──────────────
app.include_router(hip.router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
