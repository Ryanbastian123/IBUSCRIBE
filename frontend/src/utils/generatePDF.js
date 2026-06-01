/**
 * generatePDF.js
 * Generates a clinical note / prescription PDF entirely in the browser.
 * Nothing is sent to any server — the file downloads directly to the
 * doctor's device. Patient data never leaves the clinic.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (val, fallback = '—') =>
  val && String(val).trim() !== '' && val !== 'null' && val !== 'undefined'
    ? String(val).trim()
    : fallback

const fmtList = (arr, fallback = '—') =>
  Array.isArray(arr) && arr.length > 0
    ? arr.filter(Boolean).join(', ')
    : fallback

const today = () => {
  const d = new Date()
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

const GREEN  = [12, 122, 82]
const BLACK  = [15, 28, 22]
const GREY   = [90, 110, 100]
const LGREY  = [220, 230, 225]
const WHITE  = [255, 255, 255]
const BGPAGE = [250, 252, 250]

// ── Main export ──────────────────────────────────────────────────────────────

export function generateClinicalPDF({ clinicalData, intake, doctor, encounterId }) {
  const cd  = clinicalData || {}
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const PW  = doc.internal.pageSize.getWidth()   // 210
  const PH  = doc.internal.pageSize.getHeight()  // 297
  const ML  = 16   // margin left
  const MR  = 16   // margin right
  const CW  = PW - ML - MR  // content width

  let y = 0  // cursor

  // ── Background ─────────────────────────────────────────────────────────────
  doc.setFillColor(...BGPAGE)
  doc.rect(0, 0, PW, PH, 'F')

  // ── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(...GREEN)
  doc.rect(0, 0, PW, 28, 'F')

  // Logo ECG line (simple path approximation)
  doc.setDrawColor(...WHITE)
  doc.setLineWidth(0.7)
  const lx = ML, ly = 14
  const pts = [[0,0],[5,0],[7,-4],[9.5,4],[12,-4],[14,0],[22,0]]
  for (let i = 0; i < pts.length - 1; i++) {
    doc.line(lx + pts[i][0], ly + pts[i][1], lx + pts[i+1][0], ly + pts[i+1][1])
  }

  // Clinic / brand name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...WHITE)
  doc.text('ibuscribe', ML + 26, 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(200, 235, 220)
  doc.text('AI Clinical Scribe · ABDM-Ready', ML + 26, 18)

  // Date + encounter ID (right side)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...WHITE)
  const dateStr = today()
  doc.text(dateStr, PW - MR, 11, { align: 'right' })
  if (encounterId) {
    doc.text(`Enc: ${String(encounterId).slice(0, 8).toUpperCase()}`, PW - MR, 17, { align: 'right' })
  }

  y = 34

  // ── Doctor + Patient info row ───────────────────────────────────────────────
  // Left box: Doctor
  const boxH = 22
  doc.setFillColor(...WHITE)
  doc.roundedRect(ML, y, CW * 0.48, boxH, 3, 3, 'F')
  doc.setDrawColor(...LGREY)
  doc.setLineWidth(0.3)
  doc.roundedRect(ML, y, CW * 0.48, boxH, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...GREEN)
  doc.text('PRESCRIBING DOCTOR', ML + 4, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BLACK)
  doc.text(`Dr. ${fmt(doctor?.full_name, 'Attending Physician')}`, ML + 4, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GREY)
  doc.text(fmt(doctor?.specialisation, 'General Physician'), ML + 4, y + 19)

  // Right box: Patient
  const rx = ML + CW * 0.52
  const rw = CW * 0.48
  doc.setFillColor(...WHITE)
  doc.roundedRect(rx, y, rw, boxH, 3, 3, 'F')
  doc.setDrawColor(...LGREY)
  doc.roundedRect(rx, y, rw, boxH, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...GREEN)
  doc.text('PATIENT', rx + 4, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...BLACK)
  doc.text(fmt(intake?.name, 'Patient'), rx + 4, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GREY)
  const patMeta = [intake?.age && `${intake.age}y`, intake?.gender].filter(Boolean).join(' · ')
  doc.text(patMeta || '—', rx + 4, y + 19)

  if (intake?.abhaId) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...GREEN)
    doc.text(`ABHA: ${intake.abhaId}`, rx + rw - 4, y + 19, { align: 'right' })
  }

  y += boxH + 8

  // ── Chief Complaint banner ──────────────────────────────────────────────────
  if (cd.chief_complaint) {
    doc.setFillColor(232, 245, 239)
    doc.roundedRect(ML, y, CW, 12, 3, 3, 'F')
    doc.setDrawColor(...GREEN)
    doc.setLineWidth(0.4)
    doc.line(ML, y, ML, y + 12)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...GREEN)
    doc.text('CHIEF COMPLAINT', ML + 5, y + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...BLACK)
    doc.text(fmt(cd.chief_complaint), ML + 5, y + 10)
    y += 18
  }

  // ── Section helper ──────────────────────────────────────────────────────────
  const section = (title) => {
    if (y > PH - 40) { doc.addPage(); y = 16 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...GREEN)
    doc.text(title, ML, y)
    doc.setDrawColor(...GREEN)
    doc.setLineWidth(0.25)
    doc.line(ML, y + 1.5, ML + CW, y + 1.5)
    y += 6
  }

  const bodyText = (text, indent = 0) => {
    if (!text || text === '—') return
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...BLACK)
    const lines = doc.splitTextToSize(text, CW - indent)
    if (y + lines.length * 5 > PH - 20) { doc.addPage(); y = 16 }
    doc.text(lines, ML + indent, y)
    y += lines.length * 5 + 3
  }

  // ── History of Present Illness ──────────────────────────────────────────────
  if (cd.history_of_present_illness) {
    section('HISTORY OF PRESENT ILLNESS')
    bodyText(cd.history_of_present_illness)
    y += 2
  }

  // ── Vitals ──────────────────────────────────────────────────────────────────
  if (Array.isArray(cd.vitals) && cd.vitals.length > 0) {
    section('VITALS')
    const vitalRows = cd.vitals.map(v => [`${fmt(v.name)}`, `${fmt(v.value)} ${fmt(v.unit, '')}`])
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value']],
      body: vitalRows,
      margin: { left: ML, right: MR },
      tableWidth: CW,
      styles: { fontSize: 8.5, cellPadding: 3, textColor: BLACK },
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [245, 250, 247] },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: CW - 60 } },
    })
    y = doc.lastAutoTable.finalY + 6
  }

  // ── Symptoms ────────────────────────────────────────────────────────────────
  if (Array.isArray(cd.symptoms) && cd.symptoms.length > 0) {
    section('SYMPTOMS')
    const symRows = cd.symptoms.map(s => [
      fmt(s.description),
      fmt(s.duration),
      fmt(s.severity),
      fmt(s.body_site),
    ])
    autoTable(doc, {
      startY: y,
      head: [['Symptom', 'Duration', 'Severity', 'Site']],
      body: symRows,
      margin: { left: ML, right: MR },
      tableWidth: CW,
      styles: { fontSize: 8.5, cellPadding: 3, textColor: BLACK },
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [245, 250, 247] },
    })
    y = doc.lastAutoTable.finalY + 6
  }

  // ── Diagnosis ───────────────────────────────────────────────────────────────
  if (Array.isArray(cd.diagnoses) && cd.diagnoses.length > 0) {
    section('DIAGNOSIS')
    const dxRows = cd.diagnoses.map(d => [
      fmt(d.description),
      fmt(d.icd10_code),
      fmt(d.certainty),
    ])
    autoTable(doc, {
      startY: y,
      head: [['Diagnosis', 'ICD-10', 'Certainty']],
      body: dxRows,
      margin: { left: ML, right: MR },
      tableWidth: CW,
      styles: { fontSize: 8.5, cellPadding: 3, textColor: BLACK },
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [245, 250, 247] },
      columnStyles: { 0: { cellWidth: CW - 60 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 } },
    })
    y = doc.lastAutoTable.finalY + 6
  }

  // ── Prescription ────────────────────────────────────────────────────────────
  if (Array.isArray(cd.medications) && cd.medications.length > 0) {
    section('PRESCRIPTION')
    const rxRows = cd.medications.map((m, i) => [
      `${i + 1}. ${fmt(m.name)}`,
      `${fmt(m.dose)} ${fmt(m.route, '')}`,
      fmt(m.frequency),
      fmt(m.duration),
      fmt(m.instructions),
    ])
    autoTable(doc, {
      startY: y,
      head: [['Medicine', 'Dose / Route', 'Frequency', 'Duration', 'Instructions']],
      body: rxRows,
      margin: { left: ML, right: MR },
      tableWidth: CW,
      styles: { fontSize: 8.5, cellPadding: 3.5, textColor: BLACK },
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [245, 250, 247] },
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold' },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 24 },
        4: { cellWidth: CW - 132 },
      },
    })
    y = doc.lastAutoTable.finalY + 6
  }

  // ── Lab Orders ──────────────────────────────────────────────────────────────
  if (Array.isArray(cd.lab_orders) && cd.lab_orders.length > 0) {
    section('INVESTIGATIONS ORDERED')
    const labRows = cd.lab_orders.map(l => [
      fmt(l.test_name),
      fmt(l.reason),
      fmt(l.urgency),
    ])
    autoTable(doc, {
      startY: y,
      head: [['Test', 'Reason', 'Urgency']],
      body: labRows,
      margin: { left: ML, right: MR },
      tableWidth: CW,
      styles: { fontSize: 8.5, cellPadding: 3, textColor: BLACK },
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [245, 250, 247] },
    })
    y = doc.lastAutoTable.finalY + 6
  }

  // ── Allergies ───────────────────────────────────────────────────────────────
  if (Array.isArray(cd.allergies) && cd.allergies.filter(Boolean).length > 0) {
    section('KNOWN ALLERGIES')
    doc.setFillColor(255, 243, 235)
    doc.roundedRect(ML, y, CW, 10, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(180, 60, 20)
    doc.text(`⚠  ${fmtList(cd.allergies)}`, ML + 4, y + 6.5)
    y += 16
  }

  // ── Advice ──────────────────────────────────────────────────────────────────
  if (Array.isArray(cd.advice) && cd.advice.filter(Boolean).length > 0) {
    section('ADVICE & INSTRUCTIONS')
    cd.advice.filter(Boolean).forEach((line, i) => {
      bodyText(`${i + 1}.  ${line}`, 2)
    })
    y += 2
  }

  // ── Follow-up ───────────────────────────────────────────────────────────────
  if (cd.follow_up && (cd.follow_up.timeframe || cd.follow_up.instructions)) {
    section('FOLLOW-UP')
    if (cd.follow_up.timeframe) bodyText(`Review in: ${cd.follow_up.timeframe}`)
    if (cd.follow_up.instructions) bodyText(cd.follow_up.instructions)
    y += 2
  }

  // ── Signature block ─────────────────────────────────────────────────────────
  const sigY = Math.max(y + 10, PH - 42)
  doc.setDrawColor(...LGREY)
  doc.setLineWidth(0.3)
  doc.line(ML, sigY, ML + 55, sigY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GREY)
  doc.text(`Dr. ${fmt(doctor?.full_name, 'Attending Physician')}`, ML, sigY + 5)
  doc.text('Signature & Stamp', ML, sigY + 10)

  // ── Footer ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...GREEN)
  doc.rect(0, PH - 14, PW, 14, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...WHITE)
  doc.text('Generated by ibuscribe · AI Clinical Scribe · For physician use only', ML, PH - 7)
  doc.setTextColor(180, 220, 205)
  doc.text('This document was reviewed and approved by the prescribing doctor.', PW - MR, PH - 7, { align: 'right' })

  // ── Save ────────────────────────────────────────────────────────────────────
  const patientName = fmt(intake?.name, 'patient').replace(/\s+/g, '_')
  const dateSlug    = new Date().toISOString().slice(0, 10)
  doc.save(`ibuscribe_${patientName}_${dateSlug}.pdf`)
}
