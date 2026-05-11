"""
SNOMED CT integration via the public SNOMED International Snowstorm API.
No API key required — uses the public browser endpoint.

Docs: https://browser.ihtsdotools.org/
API:  https://browser.ihtsdotools.org/snowstorm/snomed-ct/

SNOMED CT codes are used alongside ICD-10 in FHIR R4 Condition resources
to provide richer clinical terminology for ABDM HIE compatibility.
"""

import httpx

SNOWSTORM_BASE = "https://browser.ihtsdotools.org/snowstorm/snomed-ct"
BRANCH         = "MAIN"                  # International edition
HEADERS        = {
    "Accept":     "application/json",
    "User-Agent": "ibuscribe/1.0 (clinical AI scribe; contact@ibuscribe.com)",
}

# Common Indian primary care diagnoses — pre-mapped for speed and reliability.
# These are validated SNOMED CT concept IDs. Used as first-pass cache before
# hitting the API, reducing latency for the most frequent diagnoses.
COMMON_CODES: dict[str, dict] = {
    # Diabetes
    "type 2 diabetes":             {"code": "44054006",  "display": "Type 2 diabetes mellitus"},
    "type 1 diabetes":             {"code": "46635009",  "display": "Type 1 diabetes mellitus"},
    "diabetes mellitus":           {"code": "73211009",  "display": "Diabetes mellitus"},
    # Hypertension
    "hypertension":                {"code": "38341003",  "display": "Hypertension"},
    "essential hypertension":      {"code": "59621000",  "display": "Essential hypertension"},
    # Respiratory
    "upper respiratory infection": {"code": "54150009",  "display": "Upper respiratory infection"},
    "uri":                         {"code": "54150009",  "display": "Upper respiratory infection"},
    "pneumonia":                   {"code": "233604007", "display": "Pneumonia"},
    "asthma":                      {"code": "195967001", "display": "Asthma"},
    "copd":                        {"code": "13645005",  "display": "Chronic obstructive lung disease"},
    # Gastro
    "gastroenteritis":             {"code": "25374005",  "display": "Gastroenteritis"},
    "gerd":                        {"code": "235595009", "display": "Gastro-esophageal reflux disease"},
    "acid reflux":                 {"code": "235595009", "display": "Gastro-esophageal reflux disease"},
    "peptic ulcer":                {"code": "13200003",  "display": "Peptic ulcer"},
    # Fever & infections
    "fever":                       {"code": "386661006", "display": "Fever"},
    "typhoid":                     {"code": "4834000",   "display": "Typhoid fever"},
    "dengue":                      {"code": "38362002",  "display": "Dengue"},
    "malaria":                     {"code": "61462000",  "display": "Malaria"},
    "tuberculosis":                {"code": "56717001",  "display": "Tuberculosis"},
    "tb":                          {"code": "56717001",  "display": "Tuberculosis"},
    # Cardiac
    "chest pain":                  {"code": "29857009",  "display": "Chest pain"},
    "heart failure":               {"code": "84114007",  "display": "Heart failure"},
    "coronary artery disease":     {"code": "53741008",  "display": "Coronary arteriosclerosis"},
    # Neurological
    "headache":                    {"code": "25064002",  "display": "Headache"},
    "migraine":                    {"code": "37796009",  "display": "Migraine"},
    "vertigo":                     {"code": "399153001", "display": "Vertigo"},
    # Musculoskeletal
    "back pain":                   {"code": "161891005", "display": "Backache"},
    "arthritis":                   {"code": "3723001",   "display": "Arthritis"},
    "osteoarthritis":              {"code": "396275006", "display": "Osteoarthritis"},
    # Thyroid
    "hypothyroidism":              {"code": "40930008",  "display": "Hypothyroidism"},
    "hyperthyroidism":             {"code": "34486009",  "display": "Hyperthyroidism"},
    # Anaemia
    "anaemia":                     {"code": "271737000", "display": "Anemia"},
    "anemia":                      {"code": "271737000", "display": "Anemia"},
    "iron deficiency anaemia":     {"code": "87522002",  "display": "Iron deficiency anemia"},
    # Skin
    "eczema":                      {"code": "43116000",  "display": "Eczema"},
    "dermatitis":                  {"code": "182782007", "display": "Dermatitis"},
    "urticaria":                   {"code": "126485001", "display": "Urticaria"},
    # Urinary
    "uti":                         {"code": "68566005",  "display": "Urinary tract infection"},
    "urinary tract infection":     {"code": "68566005",  "display": "Urinary tract infection"},
    # Mental health
    "depression":                  {"code": "35489007",  "display": "Depressive disorder"},
    "anxiety":                     {"code": "197480006", "display": "Anxiety disorder"},
}


def _lookup_cache(query: str) -> dict | None:
    """Check pre-mapped common diagnoses first (case-insensitive, partial match)."""
    q = query.lower().strip()
    # Exact match first
    if q in COMMON_CODES:
        return COMMON_CODES[q]
    # Partial match
    for key, val in COMMON_CODES.items():
        if key in q or q in key:
            return val
    return None


async def search_snomed(term: str, max_results: int = 3) -> list[dict]:
    """
    Search SNOMED CT by clinical term.
    Returns list of {code, display, system} dicts.
    Falls back gracefully if API is unavailable.
    """
    if not term or len(term.strip()) < 3:
        return []

    # Try cache first for speed
    cached = _lookup_cache(term)
    if cached:
        return [{
            "code":    cached["code"],
            "display": cached["display"],
            "system":  "http://snomed.info/sct",
            "source":  "cache",
        }]

    # Hit the public Snowstorm API
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(
                f"{SNOWSTORM_BASE}/browser/{BRANCH}/descriptions",
                params={
                    "term":         term,
                    "active":       "true",
                    "conceptActive":"true",
                    "limit":        max_results * 2,  # over-fetch to filter
                    "type":         "900000000000003001",  # FSN (Fully Specified Name)
                },
                headers=HEADERS,
            )
            if resp.status_code != 200:
                return []

            items = resp.json().get("items", [])
            results = []
            seen = set()
            for item in items:
                concept = item.get("concept", {})
                code    = concept.get("conceptId", "")
                display = item.get("term", "")
                # Deduplicate and skip meta-concepts
                if code and code not in seen and len(results) < max_results:
                    seen.add(code)
                    results.append({
                        "code":    code,
                        "display": display,
                        "system":  "http://snomed.info/sct",
                        "source":  "api",
                    })
            return results

    except (httpx.TimeoutException, httpx.RequestError):
        # Graceful degradation — SNOMED is enhancement, not critical path
        return []


async def lookup_snomed_code(concept_id: str) -> dict:
    """
    Look up a specific SNOMED CT concept by ID.
    Returns {code, display, valid, source}.
    """
    if not concept_id:
        return {"code": concept_id, "display": None, "valid": False}

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(
                f"{SNOWSTORM_BASE}/browser/{BRANCH}/concepts/{concept_id}",
                headers=HEADERS,
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "code":    concept_id,
                    "display": data.get("fsn", {}).get("term", ""),
                    "valid":   data.get("active", False),
                    "source":  "api",
                }
    except (httpx.TimeoutException, httpx.RequestError):
        pass

    return {"code": concept_id, "display": None, "valid": False, "source": "api"}


async def get_snomed_for_diagnosis(diagnosis_text: str, icd10_code: str | None = None) -> dict | None:
    """
    Main entry point: given a diagnosis string (and optionally an ICD-10 code),
    return the best matching SNOMED CT code.
    Used by fhir_builder.py to dual-code Condition resources.
    """
    results = await search_snomed(diagnosis_text, max_results=1)
    if results:
        return results[0]
    return None
