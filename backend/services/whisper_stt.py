import os
import tempfile
import aiofiles
from groq import AsyncGroq

client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])

# Groq Whisper supports these language codes
SUPPORTED_LANGUAGES = {
    "en": "en",
    "hi": "hi",
    "ta": "ta",
    "te": "te",
    "bn": "bn",
    "kn": "kn",
    "ml": "ml",
    "mr": "mr",
    "mixed": None,  # Let Whisper auto-detect for code-switched audio
}


async def transcribe_audio(audio_bytes: bytes, filename: str, language: str) -> dict:
    """
    Transcribe audio using Groq-hosted Whisper large-v3.

    Args:
        audio_bytes: Raw audio file bytes
        filename: Original filename (used for format detection)
        language: Language code (en, hi, ta, te, bn, kn, ml, mr, mixed)

    Returns:
        {"transcript": str, "language": str}
    """
    lang_code = SUPPORTED_LANGUAGES.get(language)

    # Write to a temp file — Groq SDK requires a file-like object with a name
    suffix = _get_suffix(filename)
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            kwargs = {
                "file": (filename, audio_file, _get_mime(suffix)),
                "model": "whisper-large-v3",
                "response_format": "json",
                "temperature": 0.0,
            }
            if lang_code:
                kwargs["language"] = lang_code

            response = await client.audio.transcriptions.create(**kwargs)

        return {
            "transcript": response.text.strip(),
            "language": language,
        }
    finally:
        os.unlink(tmp_path)


def _get_suffix(filename: str) -> str:
    ext = os.path.splitext(filename)[-1].lower()
    return ext if ext else ".webm"


def _get_mime(suffix: str) -> str:
    mime_map = {
        ".webm": "audio/webm",
        ".mp3": "audio/mpeg",
        ".mp4": "audio/mp4",
        ".wav": "audio/wav",
        ".m4a": "audio/mp4",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
    }
    return mime_map.get(suffix, "audio/webm")
