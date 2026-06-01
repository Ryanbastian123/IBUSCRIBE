/**
 * localDB.js — ibuscribe local-first database
 *
 * All patient records and clinical encounters are stored in IndexedDB
 * on the clinic's own device. ibuscribe's servers never see this data.
 *
 * ibuscribe's cloud only stores: doctor accounts + login (auth only).
 *
 * Schema
 * ──────
 * patients  { id, org_id, name, age, gender, phone, abha_id,
 *             allergies, past_history, current_medications,
 *             blood_group, created_at, updated_at }
 *
 * encounters { id, org_id, patient_id, patient_name,
 *              doctor_id, doctor_name,
 *              chief_complaint, clinical_data, transcript,
 *              status, created_at }
 */

import { openDB } from 'idb'

const DB_NAME    = 'ibuscribe_local'
const DB_VERSION = 1

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // ── patients ──────────────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('patients')) {
        const ps = db.createObjectStore('patients', { keyPath: 'id' })
        ps.createIndex('by_org',  'org_id')
        ps.createIndex('by_name', 'name')
      }
      // ── encounters ────────────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('encounters')) {
        const es = db.createObjectStore('encounters', { keyPath: 'id' })
        es.createIndex('by_org',     'org_id')
        es.createIndex('by_patient', 'patient_id')
        es.createIndex('by_date',    'created_at')
      }
    },
  })
}

// ── ID generator ─────────────────────────────────────────────────────────────
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ════════════════════════════════════════════════════════════════════════════
// PATIENTS
// ════════════════════════════════════════════════════════════════════════════

/** Return all patients for this org, sorted by name */
export async function getPatients(orgId) {
  const db       = await getDB()
  const all      = await db.getAllFromIndex('patients', 'by_org', orgId)
  return all.sort((a, b) => a.name.localeCompare(b.name))
}

/** Return a single patient by id */
export async function getPatient(id) {
  const db = await getDB()
  return db.get('patients', id)
}

/** Create a new patient. Returns the saved record. */
export async function createPatient(orgId, fields) {
  const db      = await getDB()
  const patient = {
    id:                   uid(),
    org_id:               orgId,
    name:                 fields.name        || '',
    age:                  fields.age         || '',
    gender:               fields.gender      || '',
    phone:                fields.phone       || '',
    abha_id:              fields.abha_id     || '',
    blood_group:          fields.blood_group || '',
    allergies:            fields.allergies   || '',
    past_history:         fields.past_history         || '',
    current_medications:  fields.current_medications  || '',
    created_at:           new Date().toISOString(),
    updated_at:           new Date().toISOString(),
  }
  await db.put('patients', patient)
  return patient
}

/** Update fields on an existing patient */
export async function updatePatient(id, fields) {
  const db      = await getDB()
  const existing = await db.get('patients', id)
  if (!existing) throw new Error('Patient not found')
  const updated = { ...existing, ...fields, updated_at: new Date().toISOString() }
  await db.put('patients', updated)
  return updated
}

/** Delete a patient and all their encounters */
export async function deletePatient(id, orgId) {
  const db  = await getDB()
  const encs = await db.getAllFromIndex('encounters', 'by_patient', id)
  const tx  = db.transaction(['patients', 'encounters'], 'readwrite')
  await tx.objectStore('patients').delete(id)
  for (const e of encs) await tx.objectStore('encounters').delete(e.id)
  await tx.done
}

// ════════════════════════════════════════════════════════════════════════════
// ENCOUNTERS
// ════════════════════════════════════════════════════════════════════════════

/** Save a new approved encounter. Returns the saved record. */
export async function saveEncounter({ orgId, patientId, patientName, doctor, intake, clinicalData, transcript, encounterId }) {
  const db      = await getDB()
  const encounter = {
    id:             encounterId || uid(),
    org_id:         orgId,
    patient_id:     patientId  || null,
    patient_name:   patientName || intake?.name || '',
    doctor_id:      doctor?.id   || '',
    doctor_name:    doctor?.full_name || '',
    chief_complaint: clinicalData?.chief_complaint || intake?.chiefComplaint || '',
    clinical_data:  clinicalData,
    transcript:     transcript || '',
    status:         'approved',
    created_at:     new Date().toISOString(),
  }
  await db.put('encounters', encounter)
  return encounter
}

/** Get all encounters for a patient */
export async function getPatientEncounters(patientId) {
  const db   = await getDB()
  const all  = await db.getAllFromIndex('encounters', 'by_patient', patientId)
  return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

/** Get all encounters for this org (for a history/audit view) */
export async function getAllEncounters(orgId) {
  const db  = await getDB()
  const all = await db.getAllFromIndex('encounters', 'by_org', orgId)
  return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

/** Get a single encounter */
export async function getEncounter(id) {
  const db = await getDB()
  return db.get('encounters', id)
}

// ════════════════════════════════════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════════════════════════════════════

/** Search patients by name or ABHA ID */
export async function searchPatients(orgId, query) {
  const all = await getPatients(orgId)
  if (!query || !query.trim()) return all
  const q = query.toLowerCase().trim()
  return all.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.abha_id && p.abha_id.includes(q)) ||
    (p.phone   && p.phone.includes(q))
  )
}

// ════════════════════════════════════════════════════════════════════════════
// STATS (for dashboard)
// ════════════════════════════════════════════════════════════════════════════

export async function getStats(orgId) {
  const [patients, encounters] = await Promise.all([
    getPatients(orgId),
    getAllEncounters(orgId),
  ])
  const today = new Date().toDateString()
  const todayEncs = encounters.filter(e => new Date(e.created_at).toDateString() === today)
  return {
    totalPatients:    patients.length,
    totalEncounters:  encounters.length,
    todayEncounters:  todayEncs.length,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORT / BACKUP (clinic can download all their data as JSON)
// ════════════════════════════════════════════════════════════════════════════

export async function exportAllData(orgId) {
  const [patients, encounters] = await Promise.all([
    getPatients(orgId),
    getAllEncounters(orgId),
  ])
  const blob = new Blob(
    [JSON.stringify({ exported_at: new Date().toISOString(), patients, encounters }, null, 2)],
    { type: 'application/json' }
  )
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ibuscribe_backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
