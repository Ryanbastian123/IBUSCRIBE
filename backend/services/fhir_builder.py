"""
FHIR R4 bundle builder — ABDM-aligned.

Builds a minimal but spec-compliant FHIR R4 Bundle of type "document"
containing a Composition, Patient, Encounter, and clinical resources.
Designed to be ABDM/HIE-compatible from day one (Phase 3 will add
HIP registration, consent artifacts, and actual push).

Reference: https://www.hl7.org/fhir/R4/
"""

import uuid
from datetime import datetime, timezone


def build_fhir_bundle(
    clinical_data: dict,
    encounter_id: str,
    patient: dict,
) -> dict:
    """
    Build a FHIR R4 Bundle from structured clinical data.

    Args:
        clinical_data: Structured output from clinical_llm.extract_clinical_data()
        encounter_id: Unique encounter identifier
        patient: Dict with name, age, gender, abha_id

    Returns:
        FHIR R4 Bundle (dict, serialisable to JSON)
    """
    now = datetime.now(timezone.utc).isoformat()
    patient_id = f"patient-{encounter_id}"
    encounter_ref_id = f"encounter-{encounter_id}"
    composition_id = f"composition-{encounter_id}"

    bundle_id = str(uuid.uuid4())
    entries = []

    # ── Patient ──────────────────────────────────────────────────────────────
    patient_resource = {
        "resourceType": "Patient",
        "id": patient_id,
        "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]},
        "name": [{"text": patient.get("name", "Unknown")}],
        "gender": _gender(patient.get("gender", "")),
        "extension": [],
    }
    if patient.get("age"):
        patient_resource["extension"].append({
            "url": "http://hl7.org/fhir/StructureDefinition/patient-age",
            "valueAge": {
                "value": int(patient["age"]),
                "unit": "years",
                "system": "http://unitsofmeasure.org",
                "code": "a",
            },
        })
    if patient.get("abha_id"):
        patient_resource["identifier"] = [{
            "type": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                    "code": "MR",
                    "display": "ABHA ID",
                }]
            },
            "system": "https://healthid.ndhm.gov.in",
            "value": patient["abha_id"],
        }]
    entries.append({"fullUrl": f"urn:uuid:{patient_id}", "resource": patient_resource})

    # ── Encounter ─────────────────────────────────────────────────────────────
    encounter_resource = {
        "resourceType": "Encounter",
        "id": encounter_ref_id,
        "status": "finished",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": "AMB",
            "display": "ambulatory",
        },
        "subject": {"reference": f"urn:uuid:{patient_id}"},
        "period": {"start": now},
    }
    entries.append({"fullUrl": f"urn:uuid:{encounter_ref_id}", "resource": encounter_resource})

    # ── Condition (diagnoses) ─────────────────────────────────────────────────
    condition_refs = []
    for i, dx in enumerate(clinical_data.get("diagnoses", [])):
        cond_id = f"condition-{encounter_id}-{i}"
        coding = [{
            "system": "http://hl7.org/fhir/sid/icd-10",
            "code": dx["icd10_code"],
            "display": dx["icd10_display"],
        }]
        if dx.get("snomed_code"):
            coding.append({
                "system": "http://snomed.info/sct",
                "code": dx["snomed_code"],
                "display": dx["description"],
            })
        condition = {
            "resourceType": "Condition",
            "id": cond_id,
            "clinicalStatus": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    "code": "active",
                }]
            },
            "verificationStatus": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                    "code": _verification(dx.get("certainty", "provisional")),
                }]
            },
            "code": {"coding": coding, "text": dx["description"]},
            "subject": {"reference": f"urn:uuid:{patient_id}"},
            "encounter": {"reference": f"urn:uuid:{encounter_ref_id}"},
            "recordedDate": now,
        }
        entries.append({"fullUrl": f"urn:uuid:{cond_id}", "resource": condition})
        condition_refs.append({"reference": f"urn:uuid:{cond_id}"})

    # ── MedicationRequest ─────────────────────────────────────────────────────
    med_refs = []
    for i, med in enumerate(clinical_data.get("medications", [])):
        med_req_id = f"medreq-{encounter_id}-{i}"
        med_req = {
            "resourceType": "MedicationRequest",
            "id": med_req_id,
            "status": "active",
            "intent": "order",
            "medicationCodeableConcept": {"text": med["name"]},
            "subject": {"reference": f"urn:uuid:{patient_id}"},
            "encounter": {"reference": f"urn:uuid:{encounter_ref_id}"},
            "authoredOn": now,
            "dosageInstruction": [{
                "text": f"{med['dose']} {med['route']} {med['frequency']}"
                        + (f" for {med['duration']}" if med.get("duration") else ""),
                "route": {"text": med.get("route", "oral")},
                "timing": {"code": {"text": med["frequency"]}},
            }],
        }
        if med.get("instructions"):
            med_req["note"] = [{"text": med["instructions"]}]
        entries.append({"fullUrl": f"urn:uuid:{med_req_id}", "resource": med_req})
        med_refs.append({"reference": f"urn:uuid:{med_req_id}"})

    # ── ServiceRequest (lab orders) ───────────────────────────────────────────
    lab_refs = []
    for i, lab in enumerate(clinical_data.get("lab_orders", [])):
        lab_req_id = f"labreq-{encounter_id}-{i}"
        lab_req = {
            "resourceType": "ServiceRequest",
            "id": lab_req_id,
            "status": "active",
            "intent": "order",
            "priority": lab.get("urgency", "routine"),
            "code": {"text": lab["test_name"]},
            "subject": {"reference": f"urn:uuid:{patient_id}"},
            "encounter": {"reference": f"urn:uuid:{encounter_ref_id}"},
            "authoredOn": now,
        }
        if lab.get("reason"):
            lab_req["reasonCode"] = [{"text": lab["reason"]}]
        entries.append({"fullUrl": f"urn:uuid:{lab_req_id}", "resource": lab_req})
        lab_refs.append({"reference": f"urn:uuid:{lab_req_id}"})

    # ── Composition ───────────────────────────────────────────────────────────
    composition_sections = []
    if clinical_data.get("chief_complaint"):
        composition_sections.append({
            "title": "Chief Complaint",
            "code": {"coding": [{"system": "http://loinc.org", "code": "10154-3"}]},
            "text": {"status": "generated", "div": f"<div>{clinical_data['chief_complaint']}</div>"},
        })
    if clinical_data.get("history_of_present_illness"):
        composition_sections.append({
            "title": "History of Present Illness",
            "code": {"coding": [{"system": "http://loinc.org", "code": "10164-2"}]},
            "text": {"status": "generated", "div": f"<div>{clinical_data['history_of_present_illness']}</div>"},
        })
    if condition_refs:
        composition_sections.append({
            "title": "Diagnoses",
            "code": {"coding": [{"system": "http://loinc.org", "code": "29548-5"}]},
            "entry": condition_refs,
        })
    if med_refs:
        composition_sections.append({
            "title": "Medications",
            "code": {"coding": [{"system": "http://loinc.org", "code": "10160-0"}]},
            "entry": med_refs,
        })
    if lab_refs:
        composition_sections.append({
            "title": "Laboratory Orders",
            "code": {"coding": [{"system": "http://loinc.org", "code": "55195-3"}]},
            "entry": lab_refs,
        })

    composition = {
        "resourceType": "Composition",
        "id": composition_id,
        "meta": {"profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord"]},
        "status": "preliminary",  # Becomes "final" on doctor approval
        "type": {
            "coding": [{
                "system": "http://snomed.info/sct",
                "code": "371530004",
                "display": "Clinical consultation report",
            }]
        },
        "subject": {"reference": f"urn:uuid:{patient_id}"},
        "encounter": {"reference": f"urn:uuid:{encounter_ref_id}"},
        "date": now,
        "title": "OP Consultation Record",
        "section": composition_sections,
    }
    entries.insert(0, {"fullUrl": f"urn:uuid:{composition_id}", "resource": composition})

    return {
        "resourceType": "Bundle",
        "id": bundle_id,
        "meta": {
            "lastUpdated": now,
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"],
        },
        "identifier": {
            "system": "https://medscribe.ai/encounter",
            "value": encounter_id,
        },
        "type": "document",
        "timestamp": now,
        "entry": entries,
    }


def _gender(gender_str: str) -> str:
    g = gender_str.lower()
    if g in ("male", "m"):
        return "male"
    if g in ("female", "f"):
        return "female"
    if g in ("other",):
        return "other"
    return "unknown"


def _verification(certainty: str) -> str:
    return {
        "confirmed": "confirmed",
        "provisional": "provisional",
        "suspected": "unconfirmed",
    }.get(certainty, "provisional")
