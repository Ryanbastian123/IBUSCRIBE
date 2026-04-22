import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.whisper_stt import transcribe_audio
from services.clinical_llm import parse_patient_intake

router = APIRouter()


class IntakeAudioRequest(BaseModel):
    audio_b64: str
    language: str = "mixed"


@router.post("/parse-intake")
async def parse_intake(body: IntakeAudioRequest):
    """
    Patient speaks their symptoms → Whisper transcribes → LLM parses into structured intake fields.
    """
    try:
        audio_bytes = base64.b64decode(body.audio_b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 audio data")

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio data is empty")

    try:
        stt_result = await transcribe_audio(audio_bytes, "audio.webm", body.language)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Transcription failed: {str(e)}")

    transcript = stt_result["transcript"]
    if not transcript.strip():
        raise HTTPException(status_code=422, detail="Could not understand the audio. Please try again.")

    try:
        intake_fields = await parse_patient_intake(transcript)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not parse intake: {str(e)}")

    return {
        "transcript": transcript,
        "intake": intake_fields,
    }
