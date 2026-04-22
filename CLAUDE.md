# MedScribe AI — Project Brief

## What This Is
Ambient AI clinical scribe for Indian primary care doctors. Doctor talks during a consultation → system transcribes → extracts structured clinical data → generates a clinical note + FHIR R4 bundle → doctor reviews and approves → pushes to ABDM HIE.

**Core invariant: the physician is always in the loop. Nothing saves or pushes without explicit doctor approval.**

## Team
Two-person bootstrapped startup, Bengaluru. Solo developer (Ryan) + MBBS doctor co-founder. No DevOps engineer — keep architecture simple and maintainable.

## Pipeline
```
Audio recording
  → POST /api/v1/transcribe  (Groq Whisper large-v3)
  → POST /api/v1/extract     (Groq Llama 3 70B → clinicalData JSON)
  → POST /api/v1/encounter   (full pipeline: base64 audio + patient metadata)
  → FHIR R4 bundle built     (fhir_builder.py)
  → Doctor reviews in UI
  → Approve → push to ABDM HIE (Phase 3)
```

## Tech Stack
- **Backend:** FastAPI, Python 3.13. No DB in Phase 1 (in-memory/JSON). No auth in Phase 1.
- **STT:** Groq Whisper large-v3
- **LLM:** Groq Llama 3 70B (`llama3-70b-8192`), temperature=0.1. Must return ONLY valid JSON — no markdown, no fences.
- **Frontend:** React, single-file `MedScribeApp.jsx`. **Inline styles only** (no Tailwind, no CSS modules). `useState`/`useRef` only (no Redux). Fetches `http://localhost:8000`.
- **Dev machine:** Windows 11, RTX 4060. Python 3.13 (PyTorch not compatible → using Groq APIs).

## Folder Structure
```
medscribe/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env                        (GROQ_API_KEY)
│   ├── routers/
│   │   ├── transcribe.py
│   │   ├── extract.py
│   │   ├── encounters.py
│   │   ├── intake.py
│   │   ├── summary.py
│   │   └── abdm.py
│   └── services/
│       ├── whisper_stt.py
│       ├── clinical_llm.py
│       ├── fhir_builder.py
│       ├── patient_summary.py
│       └── who_icd.py
└── frontend/
    └── src/
        ├── MedScribeApp.jsx        (main app)
        ├── main.jsx
        ├── components/
        │   ├── ui/Button.jsx
        │   └── layout/Navbar.jsx, Background.jsx
        └── screens/HomeScreen.jsx
```

## Design System (frontend)
Dark theme only. Always use inline styles.

```javascript
const theme = {
  bg: "#0A0F1C",
  surface: "#111827",
  surfaceHover: "#1A2236",
  card: "#161E2E",
  border: "#1E293B",
  accent: "#10B981",        // primary green — buttons, highlights
  accentDim: "rgba(16,185,129,0.12)",
  accentGlow: "rgba(16,185,129,0.3)",
  warning: "#F59E0B",
  danger: "#EF4444",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  blue: "#3B82F6",
  purple: "#8B5CF6",
};
```
Font: `'DM Sans', 'Segoe UI', -apple-system, sans-serif`  
Monospace: `'DM Mono', monospace`

## Non-Negotiable Rules
1. **PHYSICIAN IN THE LOOP** — AI never saves/pushes without doctor review + explicit approval.
2. **NEVER INVENT CLINICAL DATA** — If not in the transcript, return `null`. Wrong medication/diagnosis = patient safety issue.
3. **INDIAN CONTEXT** — Use Indian drug names (Dolo, Pan-D, Augmentin, Metformin SR), Indian disease prevalence, Indian clinical terminology.
4. **OFFLINE CAPABLE** — Architecture must not make offline mode impossible.
5. **ABDM COMPLIANCE** — All data structures must be FHIR R4 / ABDM-compatible from day one.
6. **AFFORDABLE** — Target under ₹10,000/month infra at 500 consultations/day.
7. **TWO-PERSON TEAM** — No complex architectures needing a DevOps engineer. Prioritize ruthlessly.

Flag any suggestion violating rules 1 or 2 before proceeding — these are patient safety issues.

## Roadmap Phases
- **Phase 1 (now, Weeks 1–6):** End-to-end pipeline skeleton. Real audio → real API → React UI. No DB, no auth.
- **Phase 2 (Months 3–6):** PostgreSQL, JWT auth, PDF prescriptions, WhatsApp summaries, freemium billing.
- **Phase 3 (Months 6–12):** ABDM full integration, React Native mobile, offline-first.
- **Phase 4 (Months 12–24):** Hospital contracts, lab/pharmacy routing, NHM pilots.

## Current Status (as of April 2026)
- Frontend complete (React UI with all screens + mock data)
- Backend skeleton in progress (Groq API key obtained, routers scaffolded)
- No DB yet, no customers yet — building for 5 design-partner clinics
- Research paper draft complete, targeting JMIR mHealth and uHealth
