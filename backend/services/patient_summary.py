"""
Patient-friendly summary generator.
Converts a structured clinical note (from clinical_llm.py)
into plain-language summaries — including WhatsApp-ready text.
Supports all 8 Indian languages ibuscribe handles.
"""

import json
import os
from groq import AsyncGroq
from services.who_icd import search_icd10, lookup_icd10_code

client = AsyncGroq(api_key=os.environ["GROQ_API_KEY"])

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "bn": "Bengali",
    "ml": "Malayalam",
    "mr": "Marathi",
}

SUMMARY_SYSTEM_PROMPT = """You are a compassionate medical assistant helping patients understand
their doctor's consultation in simple, friendly language.

Convert the clinical note into a patient-friendly summary.

STRICT RULES:
- Use simple words a 10-year-old can understand. Zero medical jargon.
- Never mention "SOAP", "ICD-10", "diagnosis code", "prognosis", "etiology".
- Be warm and reassuring, but honest about warning signs.
- For medications: give the common trade name used in India + exact instructions
  (when to take, how many, with or without food).
- Always include a "When to come back immediately" section.
- Keep sections short — patients won't read long paragraphs.
- If language is not English, write the ENTIRE summary in that language.

Return ONLY valid JSON in this exact structure:
{
  "greeting": "Short 1-line warm opening",
  "what_happened": "What the doctor found in 2-3 simple sentences",
  "diagnoses": [
    {"condition": "Plain-language name", "explanation": "1 simple sentence"}
  ],
  "medications": [
    {
      "name": "Brand/common name used in India",
      "purpose": "What it does in plain words",
      "instructions": "When and how many to take",
      "duration": "How many days",
      "with_food": true or false
    }
  ],
  "lifestyle_advice": ["Simple tip 1", "Simple tip 2"],
  "warning_signs": ["Come back immediately if...", "..."],
  "follow_up": "When to come back for review",
  "closing": "Short warm closing message"
}"""


async def generate_icd_codes(clinical_data: dict) -> list[dict]:
    """
    Enrich diagnoses from clinical_data with validated ICD-10 info.
    Uses WHO API if credentials are set, otherwise trusts Groq output.
    """
    enriched = []
    for dx in clinical_data.get("diagnoses", []):
        code  = dx.get("icd10_code", "")
        title = dx.get("icd10_display", dx.get("description", ""))

        if code:
            result = await lookup_icd10_code(code)
            enriched.append({
                "diagnosis":  dx.get("description", ""),
                "icd10_code": code,
                "who_title":  result.get("title") or title,
                "valid":      result.get("valid", True),
                "source":     result.get("source", "llm"),
            })
        else:
            # No code in clinical data — search by text
            results = await search_icd10(dx.get("description", ""), max_results=1)
            if results:
                enriched.append({
                    "diagnosis":  dx.get("description", ""),
                    "icd10_code": results[0]["code"],
                    "who_title":  results[0]["title"],
                    "valid":      True,
                    "source":     "who_search",
                })
            else:
                enriched.append({
                    "diagnosis":  dx.get("description", ""),
                    "icd10_code": None,
                    "who_title":  title,
                    "valid":      False,
                    "source":     "none",
                })
    return enriched


async def generate_patient_summary(
    clinical_data: dict,
    patient_name:  str = "there",
    language:      str = "en",
) -> dict:
    """
    Main entry point.
    clinical_data: output from extract_clinical_data() in clinical_llm.py
    """
    language_name = LANGUAGE_NAMES.get(language, "English")

    # Build a readable version of the clinical note for the LLM
    diagnoses_lines = "\n".join(
        f"  - {d.get('description','')} (ICD-10: {d.get('icd10_code','?')})"
        for d in clinical_data.get("diagnoses", [])
    ) or "  (none recorded)"

    meds_lines = "\n".join(
        f"  - {m.get('name','')} {m.get('dose','')} {m.get('frequency','')} for {m.get('duration','?')} — {m.get('instructions','')}"
        for m in clinical_data.get("medications", [])
    ) or "  (none prescribed)"

    advice_lines = "\n".join(
        f"  - {a}" for a in clinical_data.get("advice", [])
    ) or "  (none)"

    follow_up = clinical_data.get("follow_up", {})
    follow_up_text = (
        f"{follow_up.get('timeframe','')} — {follow_up.get('instructions','')}"
        if follow_up else "as needed"
    )

    user_content = f"""
Patient name:    {patient_name}
Target language: {language_name}

CLINICAL NOTE:
Chief complaint:  {clinical_data.get('chief_complaint', '')}
History:          {clinical_data.get('history_of_present_illness', '')}
Diagnoses:
{diagnoses_lines}
Medications:
{meds_lines}
Advice:
{advice_lines}
Follow-up: {follow_up_text}

Generate the patient-friendly summary in {language_name}.
"""

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
            {"role": "user",   "content": user_content},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_tokens=1024,
    )

    raw = response.choices[0].message.content.strip()
    summary = json.loads(raw)

    summary["patient_name"]  = patient_name
    summary["language"]      = language
    summary["language_name"] = language_name

    return summary


def build_whatsapp_message(summary: dict) -> str:
    """Convert structured summary into WhatsApp-ready plain text."""
    lines = []
    name = summary.get("patient_name", "")

    lines.append("🏥 *ibuscribe | Your Visit Summary*")
    lines.append(f"Hi {name}! {summary.get('greeting', '')}\n")

    lines.append("*What the doctor found:*")
    lines.append(summary.get("what_happened", "") + "\n")

    if summary.get("diagnoses"):
        lines.append("*Your conditions:*")
        for d in summary["diagnoses"]:
            lines.append(f"• {d['condition']} — {d['explanation']}")
        lines.append("")

    if summary.get("medications"):
        lines.append("*💊 Your medicines:*")
        for m in summary["medications"]:
            food = "after food 🍽️" if m.get("with_food") else "on empty stomach"
            lines.append(f"• *{m['name']}* ({m['purpose']})")
            lines.append(f"  {m['instructions']}, {food}, for {m['duration']}")
        lines.append("")

    if summary.get("lifestyle_advice"):
        lines.append("*✅ What to do at home:*")
        for tip in summary["lifestyle_advice"]:
            lines.append(f"• {tip}")
        lines.append("")

    if summary.get("warning_signs"):
        lines.append("*⚠️ Come back immediately if:*")
        for sign in summary["warning_signs"]:
            lines.append(f"• {sign}")
        lines.append("")

    if summary.get("follow_up"):
        lines.append(f"*📅 Follow-up:* {summary['follow_up']}\n")

    lines.append(summary.get("closing", "Take care and get well soon! 🙏"))
    lines.append("\n_Powered by ibuscribe.com_")

    return "\n".join(lines)
