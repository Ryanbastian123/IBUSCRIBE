import os
import json
from groq import AsyncGroq

client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM_PROMPT = """You are a clinical documentation assistant for Indian primary care doctors.

You will receive TWO sources of information:
1. PATIENT INTAKE FORM — filled by the patient themselves before the consultation (self-reported symptoms, duration, current medications, allergies, past history)
2. DOCTOR'S CONSULTATION TRANSCRIPT — the recorded conversation between doctor and patient during the clinical encounter

Your task: Synthesise both sources into a single structured clinical note and return it as valid JSON.

STRICT RULES:
1. Return ONLY valid JSON. No markdown, no code fences, no explanation, no preamble.
2. NEVER invent or infer clinical details not present in either source. Use null for missing fields.
3. The transcript takes precedence over the intake form for examination findings, diagnosis, and treatment decisions.
4. The intake form enriches context: use it for past history, allergies, current medications, and to cross-verify the chief complaint.
5. If the patient reported allergies in the intake form, carry them into the output — this is a patient safety requirement.
6. Use Indian drug names where applicable (e.g. Dolo 650, Pan-D, Augmentin 625, Metformin SR 500, Atorvastatin, Pantoprazole, ORS, Paracetamol IP).
7. ICD-10 codes must be valid and specific (e.g. J06.9 not just J06).
8. Handle Hindi-English, Tamil-English, Telugu-English, Kannada-English, and Bengali-English code-switching correctly.
9. For SNOMED codes, use common primary care codes. If unsure, use null — do not guess.
10. Certainty values: "confirmed", "provisional", "suspected".
11. Severity values: "mild", "moderate", "severe", or null.
12. Urgency values: "routine", "urgent", "stat".

Output JSON schema (return exactly this structure):
{
  "chief_complaint": "string",
  "history_of_present_illness": "string",
  "symptoms": [
    {
      "description": "string",
      "duration": "string or null",
      "severity": "mild|moderate|severe|null",
      "body_site": "string or null"
    }
  ],
  "vitals": [{"name": "string", "value": "string", "unit": "string"}],
  "diagnoses": [
    {
      "description": "string",
      "icd10_code": "string",
      "icd10_display": "string",
      "snomed_code": "string or null",
      "certainty": "confirmed|provisional|suspected"
    }
  ],
  "medications": [
    {
      "name": "string",
      "dose": "string",
      "route": "string",
      "frequency": "string",
      "duration": "string or null",
      "instructions": "string or null"
    }
  ],
  "allergies": ["string"],
  "lab_orders": [
    {"test_name": "string", "reason": "string or null", "urgency": "routine|urgent|stat"}
  ],
  "follow_up": {"timeframe": "string or null", "instructions": "string or null"},
  "advice": ["string"],
  "raw_transcript": "string"
}"""


INTAKE_PARSE_PROMPT = """You are helping an Indian primary care clinic collect patient information.

A patient has spoken in their own words about their visit. Extract the following from what they said and return ONLY valid JSON.

Rules:
- Return null for any field not mentioned. Do not guess or infer.
- Gender: extract as "male", "female", or "other" only.
- Severity: extract as "mild", "moderate", or "severe" only.
- Handle Hindi-English, Tamil-English, and other Indian language mixing correctly.

Return exactly this structure:
{
  "name": "string or null",
  "age": "string or null",
  "gender": "male|female|other|null",
  "chief_complaint": "string or null",
  "duration": "string or null",
  "severity": "mild|moderate|severe|null",
  "symptoms_detail": "string or null",
  "current_medications": "string or null",
  "allergies": "string or null",
  "past_history": "string or null"
}"""


async def parse_patient_intake(transcript: str) -> dict:
    """
    Parse a patient's spoken self-report into structured intake fields.
    """
    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": INTAKE_PARSE_PROMPT},
            {"role": "user", "content": f"Patient said:\n\n{transcript}"},
        ],
        temperature=0.1,
        max_tokens=512,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    return json.loads(raw)


def _build_intake_context(intake: dict) -> str:
    """Format patient intake form data as a readable context block."""
    lines = ["=== PATIENT INTAKE FORM (Self-reported) ==="]
    if intake.get("chief_complaint"):
        lines.append(f"Chief complaint: {intake['chief_complaint']}")
    if intake.get("symptom_duration"):
        lines.append(f"Duration: {intake['symptom_duration']}")
    if intake.get("symptom_severity"):
        lines.append(f"Severity (patient-reported): {intake['symptom_severity']}")
    if intake.get("symptoms_detail"):
        lines.append(f"Symptom details: {intake['symptoms_detail']}")
    if intake.get("current_medications"):
        lines.append(f"Current medications: {intake['current_medications']}")
    if intake.get("known_allergies"):
        lines.append(f"Known allergies: {intake['known_allergies']}")
    if intake.get("past_history"):
        lines.append(f"Past medical history: {intake['past_history']}")

    has_data = any(intake.get(k) for k in intake)
    if not has_data:
        return "(No patient intake form data provided)"

    return "\n".join(lines)


async def extract_clinical_data(transcript: str, intake: dict = None) -> dict:
    """
    Extract structured clinical entities from both the patient intake form
    and the doctor's consultation transcript.

    Args:
        transcript: Raw transcript text from the doctor's recording
        intake: Dict of patient-reported data from the intake form

    Returns:
        Structured clinicalData dict matching the frontend's expected shape
    """
    intake_context = _build_intake_context(intake or {})

    user_message = f"""{intake_context}

=== DOCTOR'S CONSULTATION TRANSCRIPT ===
{transcript}

Generate the complete clinical note JSON using both sources above."""

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.1,
        max_tokens=2048,
    )

    raw = response.choices[0].message.content.strip()

    # Strip accidental markdown fences
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    clinical_data = json.loads(raw)
    clinical_data["raw_transcript"] = transcript
    return clinical_data
