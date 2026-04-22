"""
WHO ICD-10 API client.
Docs: https://icd.who.int/icdapi
Register free at: https://icdaccessmanagement.who.int

Set in .env:
  WHO_ICD_CLIENT_ID=...
  WHO_ICD_CLIENT_SECRET=...

If credentials are missing the module degrades gracefully —
search/lookup return empty results so the summary pipeline
still works using Groq alone.
"""

import os
import httpx
from datetime import datetime, timedelta

_cache = {"token": None, "expires_at": None}

TOKEN_URL = "https://icdaccessmanagement.who.int/connect/token"
ICD_BASE  = "https://id.who.int/icd"
HEADERS   = {
    "Accept":          "application/json",
    "Accept-Language": "en",
    "API-Version":     "v2",
}


def _has_credentials() -> bool:
    return bool(
        os.getenv("WHO_ICD_CLIENT_ID") and os.getenv("WHO_ICD_CLIENT_SECRET")
    )


async def get_token() -> str | None:
    if not _has_credentials():
        return None

    if _cache["token"] and datetime.now() < _cache["expires_at"]:
        return _cache["token"]

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            TOKEN_URL,
            data={
                "client_id":     os.getenv("WHO_ICD_CLIENT_ID"),
                "client_secret": os.getenv("WHO_ICD_CLIENT_SECRET"),
                "scope":         "icdapi_access",
                "grant_type":    "client_credentials",
            },
        )
        resp.raise_for_status()
        data = resp.json()

    _cache["token"]      = data["access_token"]
    _cache["expires_at"] = datetime.now() + timedelta(seconds=data["expires_in"] - 60)
    return _cache["token"]


async def search_icd10(query: str, max_results: int = 5) -> list[dict]:
    """Search ICD-10 by text. Returns [] if WHO credentials not set."""
    token = await get_token()
    if not token:
        return []

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{ICD_BASE}/release/10/2019/search",
            params={
                "q":                   query,
                "useFlexiSearch":      "true",
                "flatResults":         "true",
                "highlightingEnabled": "false",
            },
            headers={**HEADERS, "Authorization": f"Bearer {token}"},
        )
        if resp.status_code != 200:
            return []

    results = []
    for entity in resp.json().get("destinationEntities", [])[:max_results]:
        results.append({
            "code":    entity.get("theCode"),
            "title":   entity.get("title"),
            "chapter": entity.get("chapter"),
        })
    return results


async def lookup_icd10_code(code: str) -> dict:
    """Validate a single ICD-10 code. Returns {valid: False} if WHO credentials not set."""
    token = await get_token()
    if not token:
        # Graceful fallback — trust the Groq output
        return {"code": code, "title": None, "valid": True, "source": "llm"}

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{ICD_BASE}/release/10/2019/{code}",
            headers={**HEADERS, "Authorization": f"Bearer {token}"},
        )

    if resp.status_code == 200:
        data = resp.json()
        return {
            "code":    code,
            "title":   data.get("title", {}).get("@value", ""),
            "valid":   True,
            "source":  "who",
        }
    return {"code": code, "title": None, "valid": False, "source": "who"}
