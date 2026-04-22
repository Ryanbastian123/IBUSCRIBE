from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import transcribe, extract, encounters, intake, abdm, summary

app = FastAPI(
    title="ibuscribe",
    description="Ambient AI clinical documentation for Indian primary care",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcribe.router, prefix="/api/v1")
app.include_router(extract.router, prefix="/api/v1")
app.include_router(encounters.router, prefix="/api/v1")
app.include_router(intake.router, prefix="/api/v1")
app.include_router(abdm.router, prefix="/api/v1")
app.include_router(summary.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
