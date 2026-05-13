"""
POST /api/v1/documents/analyze

Accepts a PDF or Word document, extracts its text, sends it to
Groq Llama for structured analysis, and returns a clean JSON summary
the doctor can review before it is merged into the patient record.
"""
import io
import os
import json
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException
from groq import AsyncGroq

logger = logging.getLogger(__name__)
router = APIRouter()
client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])

ALLOWED_MIME = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_BYTES = 20 * 1024 * 1024  # 20 MB


# ── Text extraction ────────────────────────────────────────────────────────────

def _extract_pdf(data: bytes) -> str:
    import pdfplumber
    text_parts = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    return "\n".join(text_parts).strip()


def _extract_docx(data: bytes) -> str:
    from docx import Document
    doc = Document(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()


def extract_text(content_type: str, data: bytes) -> str:
    if content_type == "application/pdf":
        return _extract_pdf(data)
    return _extract_docx(data)


# ── LLM analysis ──────────────────────────────────────────────────────────────

DOC_ANALYSIS_PROMPT = """You are a clinical document analysis assistant for Indian primary care doctors.

You will receive the raw text of a medical document (lab report, discharge summary, prior prescription, or referral letter).

Analyse the document and return ONLY valid JSON — no markdown, no code fences, no explanation.

STRICT RULES:
1. Return ONLY valid JSON.
2. NEVER invent values not present in the document. Use null for missing fields.
3. For lab values, extract the exact numeric result and unit as printed.
4. Flag abnormal values honestly — only flag if the document itself marks them abnormal OR if the value is clearly outside the stated reference range.
5. If the document is not a medical record, set document_type to "unknown" and fill only summary.

Return exactly this structure:
{
  "document_type": "lab_report | discharge_summary | prescription | referral | unknown",
  "patient_name": "string or null",
  "patient_age_sex": "string or null",
  "test_date": "string or null",
  "lab_name": "string or null",
  "referring_doctor": "string or null",
  "summary": "2-3 sentence plain English summary of the key clinical findings",
  "key_findings": [
    {
      "test": "string",
      "value": "string",
      "unit": "string or null",
      "reference_range": "string or null",
      "flag": "normal | high | low | critical_high | critical_low",
      "interpretation": "one short sentence or null"
    }
  ],
  "abnormal_values": ["short string — e.g. HbA1c 8.2% (target < 7.0%)"],
  "diagnoses_mentioned": ["string"],
  "medications_mentioned": ["string"],
  "recommendations": ["string"],
  "follow_up": "string or null"
}"""


async def analyse_with_llm(text: str) -> dict:
    if len(text) > 12000:
        text = text[:12000] + "\n\n[Document truncated for analysis]"

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": DOC_ANALYSIS_PROMPT},
            {"role": "user", "content": f"Analyse this medical document:\n\n{text}"},
        ],
        temperature=0.1,
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    return json.loads(raw)


# ── Route ─────────────────────────────────────────────────────────────────────

@router.post("/documents/analyze")
async def analyze_document(file: UploadFile = File(...)):
    """
    Upload a PDF or Word document. Returns structured clinical analysis.
    """
    # Validate type
    ct = file.content_type or ""
    if ct not in ALLOWED_MIME:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ct}'. Upload a PDF, DOC, or DOCX."
        )

    # Read + size check
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 20 MB limit.")

    # Extract text
    try:
        text = extract_text(ct, data)
    except Exception as e:
        logger.error("Text extraction failed: %s", e)
        raise HTTPException(status_code=422, detail=f"Could not extract text: {e}")

    if not text or len(text) < 30:
        raise HTTPException(
            status_code=422,
            detail="Document appears to be empty or scanned (image-only). Text extraction requires a text-based PDF."
        )

    # LLM analysis
    try:
        result = await analyse_with_llm(text)
    except json.JSONDecodeError as e:
        logger.error("LLM returned invalid JSON: %s", e)
        raise HTTPException(status_code=500, detail="Analysis model returned malformed output. Please try again.")
    except Exception as e:
        logger.error("LLM analysis error: %s", e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    result["filename"] = file.filename
    result["text_length"] = len(text)
    return result
