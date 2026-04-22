from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.whisper_stt import transcribe_audio

router = APIRouter()


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str = Form(default="mixed"),
):
    """
    Transcribe an audio file using Groq Whisper large-v3.

    - **audio**: Audio file (webm, mp3, wav, m4a, ogg, flac)
    - **language**: Language code — en, hi, ta, te, bn, kn, ml, mr, mixed
    """
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty")

    try:
        result = await transcribe_audio(audio_bytes, audio.filename or "audio.webm", language)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Transcription failed: {str(e)}")

    return result
