import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import HomeScreen from './screens/HomeScreen'
import logoImg from '../logo.PNG'

const theme = {
  bg: '#0B1A14',
  surface: '#112219',
  surfaceHover: '#162C1E',
  card: '#1A2E20',
  border: '#1E3828',
  accent: '#5EBFA3',
  accent2: '#86D4B8',
  accentInk: '#081810',
  accentDim: 'rgba(94,191,163,0.15)',
  accentGlow: 'rgba(94,191,163,0.35)',
  teal: '#5EBFA3',
  tealLight: '#86D4B8',
  tealBright: '#A8E4CE',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#E8F4EE',
  textMuted: '#7FAF90',
  textDim: '#3D6B50',
  blue: '#60A5D4',
  purple: '#A57FD4',
  orange: '#F59E0B',
  font: "'Plus Jakarta Sans', 'DM Sans', 'Segoe UI', -apple-system, sans-serif",
  mono: "'DM Mono', ui-monospace, monospace",
}

const API = 'http://localhost:8000'

const LANGUAGES = [
  { code: 'mixed', label: 'Auto-detect / Mixed' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'bn', label: 'Bengali' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
]

// ─── Global styles ────────────────────────────────────────────────────────────

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulse-ring {
        0%   { transform: scale(0.9); opacity: 0.7; }
        100% { transform: scale(1.7); opacity: 0; }
      }
      @keyframes float-orb-1 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        33%       { transform: translate(40px, -30px) scale(1.05); }
        66%       { transform: translate(-20px, 20px) scale(0.96); }
      }
      @keyframes float-orb-2 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        33%       { transform: translate(-50px, 20px) scale(1.08); }
        66%       { transform: translate(30px, -40px) scale(0.94); }
      }
      @keyframes float-orb-3 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        50%       { transform: translate(25px, 35px) scale(1.06); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes draw-path {
        0%   { stroke-dashoffset: 1200; opacity: 0; }
        6%   { opacity: 1; }
        48%  { stroke-dashoffset: 0; opacity: 0.45; }
        78%  { stroke-dashoffset: 0; opacity: 0.1; }
        95%, 100% { stroke-dashoffset: 1200; opacity: 0; }
      }
      @keyframes hero-fade-up {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes card-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes logo-glow {
        0%, 100% { filter: drop-shadow(0 0 8px rgba(94,191,163,0.3)); }
        50%       { filter: drop-shadow(0 0 18px rgba(94,191,163,0.5)); }
      }
      @keyframes bounce-in {
        0%   { transform: scale(0.5); opacity: 0; }
        70%  { transform: scale(1.1); }
        100% { transform: scale(1);   opacity: 1; }
      }
      @keyframes mic-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(94,191,163,0.35), 0 0 20px rgba(94,191,163,0.2); }
        50%       { box-shadow: 0 0 0 12px rgba(94,191,163,0), 0 0 30px rgba(94,191,163,0.3); }
      }
      input:focus, select:focus, textarea:focus {
        outline: none !important;
        border-color: ${theme.accent} !important;
        box-shadow: 0 0 0 3px rgba(94,191,163,0.1) !important;
      }
      * { box-sizing: border-box; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(94,191,163,0.2); border-radius: 4px; }
    `}</style>
  )
}




function Card3D({ children, style, delay = 0, glow }) {
  const ref = useRef(null)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 })

  const onMouseMove = e => {
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setSpotlight({ x: x * 100, y: y * 100, opacity: 1 })
  }
  const onMouseLeave = () => setSpotlight(p => ({ ...p, opacity: 0 }))

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: delay / 1000, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -5, boxShadow: glow ? '0 24px 60px rgba(94,191,163,0.18)' : '0 20px 48px rgba(0,0,0,0.1)', transition: { duration: 0.2 } }}
      style={{
        position: 'relative', overflow: 'hidden',
        background: '#1A2E20',
        border: `1px solid ${glow ? 'rgba(94,191,163,0.3)' : 'rgba(94,191,163,0.1)'}`,
        borderRadius: 20,
        boxShadow: glow ? '0 8px 40px rgba(94,191,163,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
        willChange: 'transform',
        ...style,
      }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(94,191,163,0.08) 0%, transparent 60%)`,
        opacity: spotlight.opacity, transition: 'opacity 0.3s ease',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  )
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Card({ children, style, glow }) {
  return (
    <div style={{
      background: '#1A2E20',
      border: `1px solid ${glow ? 'rgba(94,191,163,0.25)' : theme.border}`,
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: glow ? '0 0 0 2px rgba(94,191,163,0.08), 0 4px 20px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.05)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Badge({ label, color = theme.accent }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
      color, background: color + '18', border: `1px solid ${color}33`,
    }}>{label}</span>
  )
}

function SectionTitle({ children, icon }) {
  return (
    <h3 style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: theme.textDim,
      marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {icon && <span style={{ fontSize: 13 }}>{icon}</span>}{children}
    </h3>
  )
}

function Btn({ children, onClick, variant = 'primary', disabled, style }) {
  const [hovered, setHovered] = useState(false)
  const base = {
    border: 'none', borderRadius: 12, padding: '12px 28px',
    fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1, transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    fontFamily: 'inherit', transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
    ...style,
  }
  const variants = {
    primary: {
      background: hovered && !disabled
        ? 'linear-gradient(135deg, #0d5c1e, #117025)'
        : 'linear-gradient(135deg, #117025, #0d5c1e)',
      color: '#fff',
      boxShadow: hovered && !disabled ? '0 4px 20px rgba(94,191,163,0.35), 0 2px 8px rgba(0,0,0,0.1)' : '0 2px 10px rgba(94,191,163,0.2)',
    },
    teal: {
      background: hovered && !disabled
        ? 'linear-gradient(135deg, #117025, #77AA83)'
        : 'linear-gradient(135deg, #117025, #0d5c1e)',
      color: '#fff',
      boxShadow: hovered && !disabled ? '0 4px 20px rgba(94,191,163,0.3)' : '0 2px 10px rgba(94,191,163,0.15)',
    },
    danger: {
      background: hovered && !disabled
        ? 'linear-gradient(135deg, #DC2626, #b91c1c)'
        : 'linear-gradient(135deg, #DC2626, #991b1b)',
      color: '#fff',
      boxShadow: hovered && !disabled ? '0 4px 20px rgba(220,38,38,0.35)' : '0 2px 10px rgba(220,38,38,0.15)',
    },
    ghost: {
      background: hovered && !disabled ? 'rgba(94,191,163,0.06)' : 'transparent',
      color: theme.accent,
      border: `1px solid ${hovered ? 'rgba(94,191,163,0.35)' : 'rgba(94,191,163,0.2)'}`,
    },
    muted: {
      background: hovered && !disabled ? theme.surfaceHover : theme.surface,
      color: theme.textMuted, border: `1px solid ${theme.border}`,
    },
    abdm: {
      background: hovered && !disabled
        ? 'linear-gradient(135deg, #117025, #77AA83)'
        : 'linear-gradient(135deg, #0d5c1e, #117025)',
      color: '#fff',
      border: '1px solid rgba(94,191,163,0.2)',
      boxShadow: hovered && !disabled ? '0 4px 20px rgba(94,191,163,0.3)' : '0 2px 10px rgba(94,191,163,0.1)',
    },
  }
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  )
}

function Spinner({ size = 14 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: '2px solid rgba(94,191,163,0.15)', borderTopColor: theme.accent,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    }} />
  )
}

function StepIndicator({ current }) {
  const steps = ['Patient Intake', 'Consultation', 'Proforma']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      {steps.map((label, i) => {
        const done = i < current, active = i === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: done ? theme.accent : active ? theme.accentDim : theme.surface,
                border: `1.5px solid ${done || active ? theme.accent : theme.border}`,
                color: done ? '#fff' : active ? theme.accent : theme.textDim,
                boxShadow: active ? `0 0 12px ${theme.accentGlow}` : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                color: active ? theme.accent : done ? theme.textMuted : theme.textDim,
                whiteSpace: 'nowrap',
              }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 60, height: 1, margin: '0 4px', marginBottom: 18,
                background: done ? theme.accent : theme.border,
                transition: 'background 0.4s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

async function blobToBase64(blob) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => resolve(reader.result.split(',')[1])
  })
}

// Pick the best supported audio mime type for this browser
function getBestMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || ''
}

// ─── Intro animation ─────────────────────────────────────────────────────────

function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState('show')

  useEffect(() => {
    const t = setTimeout(() => setPhase('collapse'), 1900)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ clipPath: 'inset(0% 0% 0% 0% round 0px)' }}
      animate={phase === 'collapse'
        ? { clipPath: 'inset(12px calc(100% - 150px) calc(100% - 52px) 38px round 10px)' }
        : { clipPath: 'inset(0% 0% 0% 0% round 0px)' }
      }
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => { if (phase === 'collapse') onComplete() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#0b3318',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>

      <motion.div
        animate={{
          opacity: phase === 'collapse' ? 0 : 1,
          y: phase === 'collapse' ? -16 : 0,
          scale: phase === 'collapse' ? 0.88 : 1,
        }}
        transition={{ duration: phase === 'collapse' ? 0.35 : 0.8, ease: [0.23, 1, 0.32, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{
            width: 100, height: 100, borderRadius: 24,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <motion.img
            src={logoImg}
            alt="ibuscribe"
            animate={{ filter: ['drop-shadow(0 0 0px rgba(255,255,255,0))', 'drop-shadow(0 0 20px rgba(255,255,255,0.5))', 'drop-shadow(0 0 8px rgba(255,255,255,0.2))'] }}
            transition={{ duration: 1.4, times: [0, 0.45, 1], delay: 0.3 }}
            style={{ width: 68, height: 68, objectFit: 'contain', display: 'block' }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.25em' }}
          animate={{ opacity: 1, letterSpacing: '-0.025em' }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          style={{
            color: '#fff', fontSize: 'clamp(42px, 6vw, 60px)', fontWeight: 900,
            fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1,
          }}>
          <span style={{ opacity: 0.45 }}>ibu</span>scribe
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 0.38 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          style={{ color: '#fff', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>
          AI Clinical Scribe
        </motion.p>
      </motion.div>

      {/* Progress line */}
      <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', width: 100, height: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.7, ease: 'linear' }}
          style={{ height: '100%', background: 'rgba(255,255,255,0.45)', borderRadius: 1, transformOrigin: 'left' }}
        />
      </div>
    </motion.div>
  )
}

// ─── Screens ──────────────────────────────────────────────────────────────────


// ── Step 1: Patient Intake (Voice-first) ──────────────────────────────────────

function PatientIntakeScreen({ intake, setIntake, onNext, onBack }) {
  const [mode, setMode] = useState('voice') // 'voice' | 'manual' | 'confirm'
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [bars, setBars] = useState(Array(28).fill(4))
  const analyserRef = useRef(null)
  const audioCtxRef = useRef(null)
  const animRef = useRef(null)
  const timerRef = useRef(null)
  const mrRef = useRef(null)
  const chunksRef = useRef([])
  const [error, setError] = useState('')

  const inputStyle = {
    width: '100%', background: '#1A2E20',
    border: `1px solid ${theme.border}`, borderRadius: 10,
    padding: '11px 14px', color: theme.text, fontSize: 14,
    fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: 72, lineHeight: 1.6 }
  const set = key => e => setIntake(p => ({ ...p, [key]: e.target.value }))

  const startPatientRecording = async () => {
    try {
      setError('')
      // Single stream shared by both visualisation and recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Visualisation
      const audioCtx = new AudioContext()
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.7
      audioCtx.createMediaStreamSource(stream).connect(analyser)
      audioCtxRef.current = audioCtx
      analyserRef.current = analyser

      const data = new Uint8Array(analyser.frequencyBinCount)
      const animate = () => {
        analyser.getByteFrequencyData(data)
        const step = Math.floor(data.length / 28)
        setBars(Array.from({ length: 28 }, (_, i) => Math.max(4, (data[i * step] / 255) * 60)))
        animRef.current = requestAnimationFrame(animate)
      }
      animate()

      // Recording — same stream, browser picks best format
      const mimeType = getBestMimeType()
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mrRef.current = mr
      mr.start(500)

      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000)
      setIsRecording(true)
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.')
    }
  }

  const stopPatientRecording = async () => {
    setIsRecording(false)
    cancelAnimationFrame(animRef.current)
    clearInterval(timerRef.current)
    setBars(Array(28).fill(4))
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null }

    setIsProcessing(true)
    const mr = mrRef.current
    if (!mr) { setIsProcessing(false); return }
    const blob = await new Promise(resolve => {
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        mr.stream.getTracks().forEach(t => t.stop())
        resolve(b)
      }
      mr.stop()
    })
    if (!blob || blob.size === 0) { setIsProcessing(false); setError('No audio recorded. Please try again.'); return }

    try {
      const base64 = await blobToBase64(blob)
      const res = await fetch(`${API}/api/v1/parse-intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_b64: base64, language: intake.language }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed')
      const data = await res.json()
      setTranscript(data.transcript)
      // Merge parsed fields into intake, keeping non-null values
      const parsed = data.intake
      setIntake(p => ({
        ...p,
        name: parsed.name || p.name,
        age: parsed.age || p.age,
        gender: parsed.gender || p.gender,
        chiefComplaint: parsed.chief_complaint || p.chiefComplaint,
        duration: parsed.duration || p.duration,
        severity: parsed.severity || p.severity,
        symptomsDetail: parsed.symptoms_detail || p.symptomsDetail,
        currentMedications: parsed.current_medications || p.currentMedications,
        allergies: parsed.allergies || p.allergies,
        pastHistory: parsed.past_history || p.pastHistory,
      }))
      setMode('confirm')
    } catch (e) {
      setError(`Could not process speech: ${e.message}`)
      setMode('manual')
    } finally {
      setIsProcessing(false)
    }
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const canProceed = intake.name.trim() && intake.chiefComplaint.trim() && intake.consentGiven

  // Readiness tracking (for right column checklist)
  const requiredFilled = [
    { key: 'name', label: 'Patient name', ok: !!intake.name.trim() },
    { key: 'complaint', label: 'Chief complaint', ok: !!intake.chiefComplaint.trim() },
    { key: 'consent', label: 'Consent given', ok: !!intake.consentGiven },
  ]
  const optionalFilled = [
    { key: 'age', label: 'Age', ok: !!intake.age },
    { key: 'gender', label: 'Gender', ok: !!intake.gender },
    { key: 'abha', label: 'ABHA ID', ok: !!intake.abhaId.trim() },
    { key: 'duration', label: 'Duration', ok: !!intake.duration.trim() },
    { key: 'severity', label: 'Severity', ok: !!intake.severity },
    { key: 'meds', label: 'Medications', ok: !!intake.currentMedications.trim() },
    { key: 'allergies', label: 'Allergies', ok: !!intake.allergies.trim() },
  ]
  const doneReq = requiredFilled.filter(f => f.ok).length

  // Chip row primitive
  const Chip = ({ active, onClick, children, tone = 'accent' }) => {
    const toneColor = tone === 'warning' ? theme.warning : tone === 'danger' ? theme.danger : theme.accent
    return (
      <button type="button" onClick={onClick} style={{
        padding: '8px 14px', borderRadius: 999, fontSize: 13, fontFamily: 'inherit',
        border: `1px solid ${active ? toneColor : theme.border}`,
        background: active ? theme.accentDim : theme.card,
        color: active ? toneColor : theme.textMuted,
        fontWeight: active ? 600 : 500, cursor: 'pointer',
        transition: 'all .15s ease',
      }}>{children}</button>
    )
  }

  // Labels + fields
  const Label = ({ children, required }) => (
    <label style={{ fontSize: 12, color: theme.textDim, display: 'block', marginBottom: 8, fontFamily: theme.mono, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
      {children}{required && <span style={{ color: theme.accent, marginLeft: 4 }}>•</span>}
    </label>
  )
  const Rule = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '40px 0 20px' }}>
      <span style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: theme.border }} />
    </div>
  )

  const DURATION_CHIPS = ['Today', '1–3 days', '<1 week', '<1 month', 'Chronic']

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg,
      position: 'relative', zIndex: 1, animation: 'fadeIn 0.4s ease both',
      paddingBottom: 112,
    }}>
      {/* Warm mint mesh flourish, top-right */}
      <div aria-hidden style={{
        position: 'absolute', top: -100, right: -80, width: 520, height: 520,
        background: `radial-gradient(circle, ${theme.accentDim}, transparent 65%)`,
        filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── TOP BAR ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(8,18,13,0.88)', backdropFilter: 'saturate(160%) blur(16px)',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <button onClick={onBack} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer',
            fontSize: 14, fontFamily: 'inherit', padding: '6px 10px', borderRadius: 8,
          }}>← Back</button>

          <div style={{ height: 24, width: 1, background: theme.border }} />

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>Patient Intake</div>
            <div style={{ fontSize: 14, color: theme.textMuted, marginTop: 2 }}>
              {doneReq} of 3 required filled
              {doneReq === 3 && <span style={{ color: theme.accent, marginLeft: 10 }}>· ready to hand to doctor</span>}
            </div>
          </div>

          <select style={{
            background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10,
            padding: '9px 12px', color: theme.text, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          }} value={intake.language} onChange={set('language')}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── GRID ── */}
      <div style={{
        maxWidth: 1320, margin: '0 auto', padding: '36px 32px',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
        gap: 48, position: 'relative', zIndex: 1,
      }}>
        {/* ═════ LEFT: FORM ═════ */}
        <div style={{ minWidth: 0 }}>
          {error && (
            <div style={{
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              fontSize: 13, color: theme.danger,
            }}>{error}</div>
          )}

          {/* ── VOICE HERO STRIP ── */}
          <div style={{
            background: `linear-gradient(135deg, ${theme.accentDim}, rgba(134,212,184,0.10))`,
            border: `1px solid rgba(94,191,163,0.28)`, borderRadius: 20,
            padding: '28px 32px', position: 'relative', overflow: 'hidden',
          }}>
            {isProcessing ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <Spinner size={32} />
                <p style={{ color: theme.text, fontSize: 15, marginTop: 14, fontWeight: 500 }}>Transcribing and parsing…</p>
                <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 4 }}>Fields will fill in automatically.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <div
                  onClick={isRecording ? stopPatientRecording : startPatientRecording}
                  style={{
                    width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                    background: isRecording
                      ? 'linear-gradient(135deg, #EF4444, #B91C1C)'
                      : `linear-gradient(135deg, ${theme.accent}, #3B9B7C)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 30, cursor: 'pointer', color: '#fff',
                    boxShadow: isRecording
                      ? '0 0 0 0 rgba(239,68,68,0.4)'
                      : `0 14px 30px -10px ${theme.accentGlow}`,
                    animation: isRecording ? 'mic-pulse 1.5s ease-in-out infinite' : 'none',
                    position: 'relative',
                  }}
                >
                  {isRecording ? '⏹' : '🎙️'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: theme.text, fontWeight: 600, marginBottom: 4 }}>
                    {isRecording ? 'Listening…' : 'Tap and tell us about the patient'}
                  </div>
                  <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.55 }}>
                    {isRecording
                      ? 'Name · age · what\'s bothering them · medications · allergies'
                      : 'Speak naturally in any language — the form on the left fills as you go.'}
                  </div>

                  {isRecording && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36, flex: 1 }}>
                        {bars.map((h, i) => (
                          <div key={i} style={{
                            flex: 1, maxWidth: 4,
                            height: Math.max(4, h * 0.6), borderRadius: 2,
                            background: `linear-gradient(to top, ${theme.accent}, ${theme.accent2})`,
                            transition: 'height 0.08s ease', opacity: 0.9,
                          }} />
                        ))}
                      </div>
                      <span style={{ fontFamily: theme.mono, fontSize: 14, color: theme.accent, fontWeight: 600, minWidth: 44, textAlign: 'right' }}>{fmt(recordSeconds)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode === 'confirm' && transcript && !isProcessing && (
              <div style={{
                marginTop: 18, padding: '12px 16px',
                background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.accent, marginBottom: 6, fontFamily: theme.mono }}>
                  What we heard
                </div>
                <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.65, margin: 0 }}>"{transcript}"</p>
              </div>
            )}
          </div>

          {/* ── SECTION: WHO ── */}
          <Rule>01 · Who</Rule>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
            <div>
              <Label required>Full name</Label>
              <input style={inputStyle} placeholder="e.g. Rahul Sharma"
                value={intake.name} onChange={set('name')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 14 }}>
              <div>
                <Label>Age</Label>
                <input style={inputStyle} placeholder="45" value={intake.age} onChange={set('age')} />
              </div>
              <div>
                <Label>Gender</Label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[{ v: 'male', l: 'Male' }, { v: 'female', l: 'Female' }, { v: 'other', l: 'Other' }].map(g => (
                    <Chip key={g.v} active={intake.gender === g.v}
                      onClick={() => setIntake(p => ({ ...p, gender: p.gender === g.v ? '' : g.v }))}>
                      {g.l}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label>ABHA ID <span style={{ color: theme.textDim, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>— optional</span></Label>
              <input style={{ ...inputStyle, fontFamily: theme.mono, letterSpacing: '0.02em' }}
                placeholder="91-1234-5678-9012" value={intake.abhaId} onChange={set('abhaId')} />
            </div>
          </div>

          {/* ── SECTION: WHAT BRINGS THEM IN ── */}
          <Rule>02 · What brings them in</Rule>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
            <div>
              <Label required>Chief complaint</Label>
              <input style={inputStyle} placeholder="e.g. Fever and headache"
                value={intake.chiefComplaint} onChange={set('chiefComplaint')} />
            </div>
            <div>
              <Label>Since when</Label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {DURATION_CHIPS.map(d => (
                  <Chip key={d} active={intake.duration === d}
                    onClick={() => setIntake(p => ({ ...p, duration: p.duration === d ? '' : d }))}>
                    {d}
                  </Chip>
                ))}
                <input
                  style={{ ...inputStyle, padding: '8px 12px', width: 160, fontSize: 13 }}
                  placeholder="Or type…"
                  value={DURATION_CHIPS.includes(intake.duration) ? '' : intake.duration}
                  onChange={set('duration')}
                />
              </div>
            </div>
            <div>
              <Label>Severity</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ v: 'mild', l: 'Mild', tone: 'accent' }, { v: 'moderate', l: 'Moderate', tone: 'warning' }, { v: 'severe', l: 'Severe', tone: 'danger' }].map(s => (
                  <Chip key={s.v} tone={s.tone} active={intake.severity === s.v}
                    onClick={() => setIntake(p => ({ ...p, severity: p.severity === s.v ? '' : s.v }))}>
                    {s.l}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <Label>Additional details</Label>
              <textarea style={textareaStyle} placeholder="Body ache, nausea, any other symptoms…"
                value={intake.symptomsDetail} onChange={set('symptomsDetail')} />
            </div>
          </div>

          {/* ── SECTION: HISTORY ── */}
          <Rule>03 · History</Rule>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
            <div>
              <Label>Current medications</Label>
              <textarea style={{ ...textareaStyle, minHeight: 64 }}
                placeholder="e.g. Metformin 500mg, Atorvastatin 10mg — or 'None'"
                value={intake.currentMedications} onChange={set('currentMedications')} />
            </div>
            <div>
              <Label>Known allergies</Label>
              <input style={{ ...inputStyle, borderColor: intake.allergies.trim() ? 'rgba(217,119,6,0.5)' : theme.border }}
                placeholder="e.g. Penicillin — or 'None'"
                value={intake.allergies} onChange={set('allergies')} />
            </div>
            <div>
              <Label>Past medical history</Label>
              <textarea style={{ ...textareaStyle, minHeight: 64 }}
                placeholder="e.g. Hypertension (2019), Diabetes (2021)"
                value={intake.pastHistory} onChange={set('pastHistory')} />
            </div>
          </div>
        </div>

        {/* ═════ RIGHT: LIVE PREVIEW + READINESS ═════ */}
        <aside style={{
          position: 'sticky', top: 96, alignSelf: 'start',
          display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0,
        }}>
          {/* Live patient card */}
          <div style={{
            background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18,
            padding: 26, boxShadow: '0 18px 50px -30px rgba(26,36,32,0.18)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Patient preview</div>
              <span style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono }}>LIVE</span>
            </div>

            {/* Identity */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 24, color: theme.text, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
                {intake.name.trim() || <span style={{ color: theme.textDim, fontStyle: 'italic', fontWeight: 400 }}>Patient name…</span>}
              </div>
              <div style={{ color: theme.textMuted, fontSize: 14, marginTop: 4 }}>
                {intake.age && `${intake.age}y`}
                {intake.age && intake.gender && ' · '}
                {intake.gender && intake.gender.charAt(0).toUpperCase() + intake.gender.slice(1)}
                {!intake.age && !intake.gender && <span style={{ color: theme.textDim }}>Age · gender</span>}
              </div>
              {intake.abhaId.trim() && (
                <div style={{ fontFamily: theme.mono, fontSize: 12, color: theme.textDim, marginTop: 6 }}>
                  ABHA · {intake.abhaId}
                </div>
              )}
            </div>

            {/* Rows */}
            <PreviewRow label="Chief complaint" value={intake.chiefComplaint ? (
              <span>
                {intake.chiefComplaint}
                {intake.duration && <span style={{ color: theme.textMuted }}> · {intake.duration}</span>}
                {intake.severity && <span style={{ color: intake.severity === 'severe' ? theme.danger : intake.severity === 'moderate' ? theme.warning : theme.accent, textTransform: 'capitalize' }}> · {intake.severity}</span>}
              </span>
            ) : null} placeholder="Not yet captured" theme={theme} />

            <PreviewRow label="Symptoms" value={intake.symptomsDetail} theme={theme} />

            <PreviewRow label="Medications" value={intake.currentMedications} theme={theme} />

            <PreviewRow label="Allergies" value={intake.allergies} warn theme={theme} />

            <PreviewRow label="Past history" value={intake.pastHistory} theme={theme} last />
          </div>

          {/* Readiness checklist */}
          <div style={{
            background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 22,
          }}>
            <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>Readiness</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {requiredFilled.map(f => <ChecklistRow key={f.key} label={f.label} ok={f.ok} required theme={theme} />)}
              <div style={{ height: 1, background: theme.border, margin: '6px 0' }} />
              {optionalFilled.map(f => <ChecklistRow key={f.key} label={f.label} ok={f.ok} theme={theme} />)}
            </div>
          </div>
        </aside>
      </div>

      {/* ── STICKY FOOTER ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(8,18,13,0.94)', backdropFilter: 'saturate(160%) blur(16px)',
        borderTop: `1px solid ${theme.border}`,
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1, minWidth: 0 }}
            onClick={() => setIntake(p => ({ ...p, consentGiven: !p.consentGiven }))}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              border: `2px solid ${intake.consentGiven ? theme.accent : theme.border}`,
              background: intake.consentGiven ? theme.accent : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s',
              boxShadow: intake.consentGiven ? `0 0 0 4px ${theme.accentDim}` : 'none',
            }}>
              {intake.consentGiven && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.5 }}>
              Patient has given verbal consent for AI-assisted documentation (ABDM compliant).
            </span>
          </label>

          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button onClick={onBack} style={{
              padding: '12px 22px', borderRadius: 12,
              background: 'transparent', border: `1px solid ${theme.border}`, color: theme.text,
              fontSize: 14, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500,
            }}>Back</button>
            <button onClick={onNext} disabled={!canProceed} style={{
              padding: '12px 26px', borderRadius: 12, border: 'none',
              background: canProceed ? theme.accent : theme.surfaceHover,
              color: canProceed ? theme.accentInk : theme.textDim,
              fontSize: 14, fontFamily: 'inherit', cursor: canProceed ? 'pointer' : 'not-allowed',
              fontWeight: 600, letterSpacing: '-0.01em',
              boxShadow: canProceed ? `0 10px 28px -10px ${theme.accentGlow}` : 'none',
              transition: 'all .15s',
            }}>Start consultation →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview card row
function PreviewRow({ label, value, placeholder = '—', warn, last, theme }) {
  const hasValue = value && (typeof value === 'string' ? value.trim() : true)
  return (
    <div style={{ paddingBottom: 14, marginBottom: 14, borderBottom: last ? 'none' : `1px dashed ${theme.border}` }}>
      <div style={{ fontSize: 10, color: warn && hasValue ? theme.warning : theme.textDim, fontFamily: theme.mono, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        {warn && hasValue && <span>⚠</span>}{label}
      </div>
      <div style={{ fontSize: 14, color: hasValue ? (warn ? theme.warning : theme.text) : theme.textDim, lineHeight: 1.55, fontStyle: hasValue ? 'normal' : 'italic', fontWeight: warn && hasValue ? 500 : 400 }}>
        {hasValue ? value : placeholder}
      </div>
    </div>
  )
}

function ChecklistRow({ label, ok, required, theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
      <span style={{
        width: 18, height: 18, borderRadius: 99, flexShrink: 0,
        background: ok ? theme.accent : 'transparent',
        border: `1.5px solid ${ok ? theme.accent : theme.border}`,
        display: 'grid', placeItems: 'center', color: '#fff', fontSize: 11, fontWeight: 700,
      }}>{ok ? '✓' : ''}</span>
      <span style={{ color: ok ? theme.text : theme.textMuted }}>{label}</span>
      {required && !ok && <span style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.1em', marginLeft: 'auto' }}>REQUIRED</span>}
    </div>
  )
}

// ── Step 2: Doctor + Patient Consultation Recording ───────────────────────────

function ConsultationScreen({ onStop, intake, analyser }) {
  const [seconds, setSeconds] = useState(0)
  const [bars, setBars] = useState(Array(60).fill(4))
  const animRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (!analyser) {
      const idle = setInterval(() => setBars(Array.from({ length: 60 }, () => 4 + Math.random() * 14)), 120)
      return () => clearInterval(idle)
    }
    const data = new Uint8Array(analyser.frequencyBinCount)
    const animate = () => {
      analyser.getByteFrequencyData(data)
      const step = Math.floor(data.length / 60)
      setBars(Array.from({ length: 60 }, (_, i) => Math.max(4, (data[i * step] / 255) * 88)))
      animRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animRef.current)
  }, [analyser])

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const capturedChips = [
    { icon: '🎙', label: 'Transcribing both voices', active: true },
    { icon: '⚠', label: intake.allergies ? `Allergy flagged · ${intake.allergies}` : 'No allergies on file', active: !!intake.allergies, warn: !!intake.allergies },
    { icon: '💊', label: intake.currentMedications ? 'Medication context loaded' : 'No active medications', active: !!intake.currentMedications },
    { icon: '✓', label: 'Intake handed off', active: true },
  ]

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg, position: 'relative', zIndex: 1,
      animation: 'fadeIn 0.4s ease both',
    }}>
      {/* Soft mint halo behind the stage */}
      <div aria-hidden style={{
        position: 'absolute', top: 40, right: '12%', width: 620, height: 620,
        background: `radial-gradient(circle, ${theme.accentDim}, transparent 65%)`,
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── TOP BAR ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(8,18,13,0.88)', backdropFilter: 'saturate(160%) blur(16px)',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>Step 2 of 3</div>
            <div style={{ fontSize: 14, color: theme.textMuted, marginTop: 2 }}>Consultation in session</div>
          </div>

          {/* REC badge — always visible */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px',
            borderRadius: 999, background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.32)',
            fontSize: 12, fontWeight: 700, color: theme.danger, letterSpacing: '0.1em',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: theme.danger,
              boxShadow: '0 0 0 0 rgba(220,38,38,0.6)',
              animation: 'mic-pulse 1.4s ease-in-out infinite',
            }} />
            REC · <span style={{ fontFamily: theme.mono, fontWeight: 600, letterSpacing: '0.04em' }}>{fmt(seconds)}</span>
          </span>
        </div>
      </div>

      {/* ── GRID ── */}
      <div style={{
        maxWidth: 1320, margin: '0 auto', padding: '36px 32px 48px',
        display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 1.8fr)',
        gap: 40, position: 'relative', zIndex: 1,
      }}>
        {/* ═════ LEFT: PATIENT CONTEXT ═════ */}
        <aside style={{
          position: 'sticky', top: 96, alignSelf: 'start',
          display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0,
        }}>
          <div style={{
            background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18,
            padding: 24, boxShadow: '0 18px 50px -30px rgba(26,36,32,0.18)',
          }}>
            <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>
              Patient on record
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 22, color: theme.text, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
                {intake.name || 'Unnamed patient'}
              </div>
              <div style={{ color: theme.textMuted, fontSize: 14, marginTop: 4 }}>
                {intake.age && `${intake.age}y`}
                {intake.age && intake.gender && ' · '}
                {intake.gender && intake.gender.charAt(0).toUpperCase() + intake.gender.slice(1)}
              </div>
              {intake.abhaId && (
                <div style={{ fontFamily: theme.mono, fontSize: 12, color: theme.textDim, marginTop: 6 }}>
                  ABHA · {intake.abhaId}
                </div>
              )}
            </div>

            <ContextRow label="Chief complaint" theme={theme}>
              {intake.chiefComplaint || <em style={{ color: theme.textDim }}>not captured</em>}
              {intake.duration && <span style={{ color: theme.textMuted }}> · {intake.duration}</span>}
              {intake.severity && <span style={{ color: intake.severity === 'severe' ? theme.danger : intake.severity === 'moderate' ? theme.warning : theme.accent, textTransform: 'capitalize' }}> · {intake.severity}</span>}
            </ContextRow>

            {intake.symptomsDetail && (
              <ContextRow label="Symptoms" theme={theme}>{intake.symptomsDetail}</ContextRow>
            )}

            {intake.allergies && (
              <ContextRow label="Allergies" warn theme={theme}>{intake.allergies}</ContextRow>
            )}

            {intake.currentMedications && (
              <ContextRow label="Medications" theme={theme}>{intake.currentMedications}</ContextRow>
            )}

            {intake.pastHistory && (
              <ContextRow label="Past history" theme={theme} last>{intake.pastHistory}</ContextRow>
            )}
          </div>

          <div style={{
            background: 'transparent', border: `1px dashed ${theme.border}`,
            borderRadius: 14, padding: '14px 16px',
            fontSize: 12, color: theme.textMuted, lineHeight: 1.6,
          }}>
            <div style={{ fontFamily: theme.mono, fontSize: 10, color: theme.textDim, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Tips</div>
            Speak naturally — Hindi, English, Tamil, or mixed all work. Background noise is fine. The AI follows your pace.
          </div>
        </aside>

        {/* ═════ RIGHT: STAGE ═════ */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
          {/* Pulse-ring mic visual */}
          <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 18 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `1.5px solid rgba(94,191,163,${0.42 - i * 0.08})`,
                animation: `pulse-ring ${1.6 + i * 0.4}s ease-out ${i * 0.25}s infinite`,
              }} />
            ))}
            <div style={{
              position: 'absolute', inset: 24, borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.accentDim}, rgba(94,191,163,0.04))`,
              border: `1.5px solid rgba(94,191,163,0.32)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 54, boxShadow: `0 0 60px ${theme.accentGlow}`,
            }}>🎙️</div>
          </div>

          {/* Massive timer */}
          <div style={{
            fontSize: 96, fontWeight: 700, fontFamily: theme.mono,
            letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 28,
            background: `linear-gradient(135deg, #3B9B7C, ${theme.accent}, ${theme.accent2})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {fmt(seconds)}
          </div>

          {/* Full-width waveform */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: 4, height: 96, width: '100%', maxWidth: 720, marginBottom: 20,
          }}>
            {bars.map((h, i) => (
              <div key={i} style={{
                flex: 1, maxWidth: 6,
                height: Math.max(4, h), borderRadius: 3,
                background: `linear-gradient(to top, ${theme.accent}, ${theme.accent2})`,
                opacity: 0.7 + (h / 88) * 0.3,
                transition: 'height 0.08s ease',
                boxShadow: h > 40 ? `0 0 10px ${theme.accentGlow}` : 'none',
              }} />
            ))}
          </div>

          {/* Status caption */}
          <div style={{ textAlign: 'center', marginBottom: 32, maxWidth: 460 }}>
            <div style={{ fontSize: 16, color: theme.text, fontWeight: 500, marginBottom: 4 }}>
              Listening to the consultation…
            </div>
            <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>
              Both doctor and patient should speak naturally. The AI is drafting the note in the background.
            </div>
          </div>

          {/* "Being captured" panel */}
          <div style={{
            width: '100%', maxWidth: 560, marginBottom: 36,
            background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16,
            padding: '18px 22px',
          }}>
            <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
              Being captured
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {capturedChips.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5,
                  color: c.active ? (c.warn ? theme.warning : theme.text) : theme.textDim,
                }}>
                  <span style={{
                    display: 'inline-grid', placeItems: 'center',
                    width: 28, height: 28, borderRadius: 8,
                    background: c.active ? (c.warn ? 'rgba(217,119,6,0.12)' : theme.accentDim) : 'transparent',
                    border: `1px solid ${c.active ? (c.warn ? 'rgba(217,119,6,0.3)' : 'rgba(94,191,163,0.3)') : theme.border}`,
                    fontSize: 13,
                  }}>{c.icon}</span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stop button */}
          <button onClick={onStop} style={{
            padding: '16px 40px', borderRadius: 14, border: 'none',
            background: theme.accent, color: theme.accentInk,
            fontSize: 15, fontFamily: 'inherit', fontWeight: 600, letterSpacing: '-0.01em',
            cursor: 'pointer', boxShadow: `0 14px 36px -12px ${theme.accentGlow}`,
            transition: 'transform .15s ease, filter .15s ease',
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.05)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none' }}
          >
            <span style={{ display: 'inline-block', width: 10, height: 10, background: theme.accentInk, borderRadius: 2 }} />
            Stop & generate note
          </button>
          <div style={{ fontSize: 12, color: theme.textDim, marginTop: 12 }}>
            The draft will appear for your review — nothing is saved until you approve it.
          </div>
        </section>
      </div>
    </div>
  )
}

function ContextRow({ label, children, warn, last, theme }) {
  return (
    <div style={{ paddingBottom: 12, marginBottom: 12, borderBottom: last ? 'none' : `1px dashed ${theme.border}` }}>
      <div style={{ fontSize: 10, color: warn ? theme.warning : theme.textDim, fontFamily: theme.mono, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
        {warn && <span>⚠</span>}{label}
      </div>
      <div style={{ fontSize: 13.5, color: warn ? theme.warning : theme.text, lineHeight: 1.55, fontWeight: warn ? 500 : 400 }}>
        {children}
      </div>
    </div>
  )
}

// ── Processing ─────────────────────────────────────────────────────────────────

function ProcessingScreen() {
  const steps = [
    { label: 'Transcribing consultation', sub: 'Groq Whisper large-v3 · both voices', icon: '🎙️' },
    { label: 'Generating ABDM proforma', sub: 'Llama 3.3 70B · intake + transcript', icon: '🧠' },
    { label: 'Building FHIR R4 bundle', sub: 'ABDM OP Consultation Note', icon: '📋' },
  ]
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => Math.min(a + 1, steps.length - 1)), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', zIndex: 1, animation: 'fadeIn 0.4s ease both',
    }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: theme.accentDim, border: `1.5px solid ${theme.accentGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 20px',
            animation: 'logo-glow 2s ease-in-out infinite',
          }}>⚡</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Generating Proforma</h2>
          <p style={{ color: theme.textMuted, fontSize: 14 }}>Combining intake data with consultation recording…</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {steps.map((step, i) => {
            const done = i < active, inProgress = i === active
            return (
              <div key={i}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', borderRadius: 14,
                  background: inProgress ? 'rgba(94,191,163,0.05)' : done ? 'rgba(94,191,163,0.03)' : '#FFFFFF',
                  border: `1px solid ${inProgress ? 'rgba(94,191,163,0.25)' : done ? 'rgba(94,191,163,0.12)' : theme.border}`,
                  transition: 'all 0.4s ease',
                  boxShadow: inProgress ? '0 4px 20px rgba(94,191,163,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done || inProgress ? 'rgba(94,191,163,0.08)' : theme.surface,
                    border: `1.5px solid ${done ? theme.accent : inProgress ? 'rgba(94,191,163,0.4)' : theme.border}`,
                    color: done ? theme.accent : inProgress ? theme.accent : theme.textDim,
                    boxShadow: inProgress ? '0 0 12px rgba(94,191,163,0.15)' : 'none',
                  }}>
                    {done ? '✓' : inProgress ? <Spinner /> : step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: inProgress || done ? theme.text : theme.textDim, marginBottom: 2 }}>{step.label}</p>
                    <p style={{ fontSize: 12, color: theme.textDim }}>{step.sub}</p>
                  </div>
                  {done && <span style={{ fontSize: 12, color: theme.accent, fontWeight: 600 }}>Done</span>}
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 2, height: 8, margin: '0 auto',
                    background: i < active ? `linear-gradient(to bottom, ${theme.accent}, rgba(94,191,163,0.15))` : theme.border,
                    transition: 'background 0.6s ease',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Proforma Review (Hospital Clinical Proforma format) ────────────────────────

function ProformaScreen({ clinicalData, fhirBundle, encounterId, intake, onApprove, onDiscard }) {
  const [showFhir, setShowFhir] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  if (!clinicalData) return null

  const certColor   = { confirmed: theme.accent, provisional: theme.warning, suspected: theme.blue }
  const urgColor    = { routine: theme.textMuted, urgent: theme.warning, stat: theme.danger }
  const urgBg       = { routine: 'rgba(127,175,144,0.08)', urgent: 'rgba(245,158,11,0.10)', stat: 'rgba(239,68,68,0.10)' }
  const now         = new Date()
  const dateStr     = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr     = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const checks = [
    { label: 'Chief complaint',            ok: !!clinicalData.chief_complaint },
    { label: `${clinicalData.diagnoses?.length || 0} diagnosis(es) with ICD-10`, ok: !!clinicalData.diagnoses?.length },
    { label: `${clinicalData.medications?.length || 0} medication(s) prescribed`, ok: !!clinicalData.medications?.length },
    { label: 'Follow-up noted',            ok: !!clinicalData.follow_up?.timeframe },
    { label: `${clinicalData.vitals?.length || 0} vital(s) recorded`, ok: !!clinicalData.vitals?.length },
    { label: `${clinicalData.lab_orders?.length || 0} investigation(s) ordered`, ok: !!clinicalData.lab_orders?.length },
  ]

  // ── Sub-components ──────────────────────────────────────────────────────────

  // Section header: numbered, with divider line
  const Section = ({ num, title, id, color = theme.accent }) => (
    <div id={id} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 14px' }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: `${color}1A`, border: `1px solid ${color}50`,
        display: 'grid', placeItems: 'center',
        fontSize: 11, fontWeight: 700, color, fontFamily: theme.mono,
      }}>{num}</div>
      <span style={{
        fontSize: 10.5, fontWeight: 700, color,
        fontFamily: theme.mono, letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>{title}</span>
      <div style={{ flex: 1, borderBottom: `1px dashed ${color}28` }} />
    </div>
  )

  // Field row: label + dashed line + value (for patient ID grid)
  const Field = ({ label, value, wide }) => (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 6,
      gridColumn: wide ? 'span 2' : 'span 1',
      paddingBottom: 10,
      borderBottom: `1px dashed ${theme.border}`,
    }}>
      <span style={{
        fontSize: 10.5, color: theme.textDim, fontWeight: 600,
        fontFamily: theme.mono, letterSpacing: '0.08em', textTransform: 'uppercase',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>{label}:</span>
      <span style={{ fontSize: 13.5, color: value ? theme.text : theme.textDim, fontWeight: value ? 500 : 400, flex: 1 }}>
        {value || '—'}
      </span>
    </div>
  )

  const vitalName = (name) => {
    const map = { 'blood_pressure':'BP', 'pulse':'Pulse', 'heart_rate':'HR', 'temperature':'Temp',
      'respiratory_rate':'RR', 'spo2':'SpO₂', 'weight':'Weight', 'height':'Height',
      'bmi':'BMI', 'random_blood_glucose':'RBG' }
    return map[name?.toLowerCase()] || name
  }
  const vitalUnit = (v) => v.unit || ''

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, animation: 'fadeIn 0.4s ease both', paddingBottom: 60 }}>

      {/* ── TOP NAV BAR ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: `${theme.bg}E8`, backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 32px', height: 58, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 10.5, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Step 3 of 3 &nbsp;·&nbsp;</span>
            <span style={{ fontSize: 13, color: theme.textMuted }}>Review &amp; approve consultation note</span>
          </div>
          {/* Jump anchors */}
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {[
              { id: 'sec-id',   label: 'Patient' },
              { id: 'sec-cc',   label: 'CC / HPI' },
              { id: 'sec-pmh',  label: 'History' },
              { id: 'sec-exam', label: 'Examination' },
              { id: 'sec-dx',   label: 'Diagnosis' },
              { id: 'sec-plan', label: 'Plan' },
            ].map(j => (
              <button key={j.id} onClick={() => scrollTo(j.id)} style={{
                padding: '5px 11px', borderRadius: 7, fontSize: 11.5, fontWeight: 500,
                border: `1px solid ${theme.border}`, background: theme.card,
                color: theme.textMuted, cursor: 'pointer', transition: 'all .15s',
                fontFamily: theme.mono,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
              >{j.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAGE GRID ── */}
      <div style={{
        maxWidth: 1360, margin: '0 auto', padding: '28px 32px 0',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: 28, alignItems: 'start',
      }}>

        {/* ══════════════════════════════════════════════════
            MAIN — HOSPITAL PROFORMA DOCUMENT
        ══════════════════════════════════════════════════ */}
        <div style={{ minWidth: 0 }}>

          {/* ── LETTERHEAD ── */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 2,
          }}>
            {/* Top stripe */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${theme.accent} 0%, ${theme.tealLight} 100%)` }} />
            <div style={{ padding: '18px 26px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: theme.text, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  OPD Consultation Record
                </div>
                <div style={{ fontSize: 11, color: theme.textDim, fontFamily: theme.mono, marginTop: 5, letterSpacing: '0.05em' }}>
                  ABDM FHIR R4 · OP Consultation Note · AI-assisted draft
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13.5, color: theme.text, fontWeight: 600 }}>{dateStr}</div>
                <div style={{ fontSize: 12, color: theme.textMuted, fontFamily: theme.mono, marginTop: 3 }}>{timeStr}</div>
                {encounterId && (
                  <div style={{ fontSize: 10.5, color: theme.textDim, fontFamily: theme.mono, marginTop: 4 }}>
                    UHID / Enc: {encounterId.slice(0, 18)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── MAIN PROFORMA BODY ── */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            padding: '4px 26px 26px',
          }}>

            {/* ════ 1. PATIENT IDENTIFICATION ════ */}
            <Section num="1" title="Patient Identification" id="sec-id" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 28px' }}>
              <Field label="Name" value={intake.name} wide />
              <Field label="Age / DOB" value={intake.age ? `${intake.age} years` : null} />
              <Field label="Sex" value={intake.gender ? intake.gender.charAt(0).toUpperCase() + intake.gender.slice(1) : null} />
              <Field label="ABHA ID" value={intake.abhaId} />
              <Field label="Language" value={intake.language} />
              <Field label="Date of Examination" value={dateStr} />
            </div>

            {intake.allergies && (
              <div style={{
                marginTop: 14, padding: '10px 16px',
                background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.30)',
                borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: theme.warning, fontFamily: theme.mono, flexShrink: 0 }}>⚠ ALLERGY ALERT</span>
                <span style={{ fontSize: 14, color: '#FDE68A', fontWeight: 600 }}>{intake.allergies}</span>
              </div>
            )}

            {/* ════ 2. CHIEF COMPLAINTS ════ */}
            <Section num="2" title="Chief Complaints" id="sec-cc" />
            <div style={{ padding: '4px 0 8px' }}>
              {clinicalData.chief_complaint ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: theme.accent, fontWeight: 700, flexShrink: 0, marginTop: 1, fontSize: 16 }}>•</span>
                  <span style={{ fontSize: 17, fontWeight: 600, color: theme.text, lineHeight: 1.4 }}>
                    {clinicalData.chief_complaint}
                    {intake.duration && (
                      <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 400, marginLeft: 10 }}>
                        — {intake.duration}
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 14, color: theme.textDim, fontStyle: 'italic' }}>Not recorded</span>
              )}
              {intake.chiefComplaint && intake.chiefComplaint !== clinicalData.chief_complaint && (
                <div style={{ marginTop: 8, paddingLeft: 22, fontSize: 12.5, color: theme.textDim, fontStyle: 'italic' }}>
                  Patient's words: "{intake.chiefComplaint}"
                </div>
              )}
            </div>

            {/* ════ 3. HISTORY OF PRESENT ILLNESS ════ */}
            {clinicalData.history_of_present_illness && (
              <>
                <Section num="3" title="History of Present Illness" id="sec-hpi" />
                <p style={{
                  fontSize: 14, lineHeight: 1.85, color: theme.text, margin: '0 0 4px',
                  paddingLeft: 2,
                }}>{clinicalData.history_of_present_illness}</p>
              </>
            )}

            {/* ════ 4. PAST MEDICAL HISTORY ════ */}
            <Section num="4" title="Past Medical / Drug History" id="sec-pmh" />
            {intake.pastHistory ? (
              <p style={{ fontSize: 14, color: theme.text, lineHeight: 1.75, margin: '0 0 8px', paddingLeft: 2 }}>
                {intake.pastHistory}
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 16px', padding: '2px 0 8px' }}>
                {['DM', 'HTN', 'TB', 'IHD', 'Asthma', 'CKD', 'Epilepsy', 'Thyroid'].map(c => (
                  <div key={c} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${theme.border}`,
                      background: theme.surface, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, color: theme.textMuted }}>{c}</span>
                  </div>
                ))}
              </div>
            )}

            {intake.currentMedications && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, color: theme.textDim, fontFamily: theme.mono, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current Medications: </span>
                <span style={{ fontSize: 13.5, color: theme.textMuted }}>{intake.currentMedications}</span>
              </div>
            )}

            {/* ════ 5. GENERAL PHYSICAL EXAMINATION ════ */}
            <Section num="5" title="General Physical Examination" id="sec-exam" color={theme.blue} />
            <div style={{ fontSize: 10.5, color: theme.blue, fontFamily: theme.mono, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              Vital Signs
            </div>

            {clinicalData.vitals?.length > 0 ? (
              <div style={{ overflowX: 'auto', marginBottom: 6 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                      {clinicalData.vitals.map((v, i) => (
                        <th key={i} style={{
                          padding: '8px 14px 8px 0', textAlign: 'left',
                          color: theme.textDim, fontFamily: theme.mono, fontSize: 10.5,
                          fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}>{vitalName(v.name)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {clinicalData.vitals.map((v, i) => (
                        <td key={i} style={{
                          padding: '12px 14px 12px 0', verticalAlign: 'baseline',
                          borderBottom: `1px dashed ${theme.border}`,
                        }}>
                          <span style={{ fontSize: 22, fontWeight: 700, color: theme.accent, fontFamily: theme.mono, letterSpacing: '-0.02em' }}>
                            {v.value}
                          </span>
                          {vitalUnit(v) && (
                            <span style={{ fontSize: 11, color: theme.textMuted, marginLeft: 4 }}>{vitalUnit(v)}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '10px 0', color: theme.textDim, fontSize: 13.5, fontStyle: 'italic' }}>
                No vitals recorded during this consultation
              </div>
            )}

            {/* ════ 6. ASSESSMENT / DIFFERENTIAL DIAGNOSIS ════ */}
            <Section num="6" title="Assessment / Diagnosis" id="sec-dx" color={theme.warning} />

            {clinicalData.diagnoses?.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {clinicalData.diagnoses.map((dx, i) => (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr auto',
                    gap: '0 14px',
                    alignItems: 'start',
                    padding: '12px 16px',
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderLeft: `3px solid ${certColor[dx.certainty] || theme.textMuted}`,
                    borderRadius: 10,
                  }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: theme.textDim,
                      fontFamily: theme.mono, paddingTop: 2,
                    }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, lineHeight: 1.35, marginBottom: 5 }}>
                        {dx.description}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          padding: '2px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 700,
                          fontFamily: theme.mono, letterSpacing: '0.05em',
                          background: 'rgba(96,165,212,0.12)', color: theme.blue,
                          border: '1px solid rgba(96,165,212,0.28)',
                        }}>{dx.icd10_code}</span>
                        {dx.icd10_display && (
                          <span style={{ fontSize: 12, color: theme.textDim }}>{dx.icd10_display}</span>
                        )}
                        {dx.snomed_code && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            fontFamily: theme.mono, background: 'rgba(165,127,212,0.10)',
                            color: theme.purple, border: '1px solid rgba(165,127,212,0.25)',
                          }}>SNOMED {dx.snomed_code}</span>
                        )}
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: `${certColor[dx.certainty] || theme.textMuted}14`,
                      color: certColor[dx.certainty] || theme.textMuted,
                      border: `1px solid ${certColor[dx.certainty] || theme.textMuted}35`,
                      whiteSpace: 'nowrap', marginTop: 2,
                    }}>{dx.certainty}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '10px 0', color: theme.textDim, fontSize: 13.5, fontStyle: 'italic' }}>No diagnoses recorded</div>
            )}

            {/* ════ 7. PLAN ════ */}
            <Section num="7" title="Management Plan" id="sec-plan" color={theme.purple} />

            {/* 7a. Prescription */}
            {clinicalData.medications?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10.5, color: theme.purple, fontFamily: theme.mono, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                  ℞ Prescription
                </div>
                <div style={{ display: 'grid', gap: 0, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  {/* Table header */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                    padding: '8px 14px', background: theme.surface,
                    borderBottom: `1px solid ${theme.border}`,
                  }}>
                    {['Drug', 'Dose', 'Frequency', 'Duration'].map(h => (
                      <span key={h} style={{ fontSize: 10, color: theme.textDim, fontFamily: theme.mono, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{h}</span>
                    ))}
                  </div>
                  {clinicalData.medications.map((m, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                      padding: '12px 14px', alignItems: 'start',
                      borderBottom: i < clinicalData.medications.length - 1 ? `1px dashed ${theme.border}` : 'none',
                      background: i % 2 === 0 ? 'transparent' : `${theme.accent}04`,
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{m.name}</div>
                        {m.instructions && <div style={{ fontSize: 11.5, color: theme.textDim, marginTop: 3 }}>{m.instructions}</div>}
                        {m.route && m.route !== 'oral' && (
                          <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2, fontFamily: theme.mono }}>via {m.route}</div>
                        )}
                      </div>
                      <div style={{ fontSize: 14, color: theme.textMuted }}>{m.dose || '—'}</div>
                      <div style={{ fontSize: 14, color: theme.textMuted }}>{m.frequency || '—'}</div>
                      <div style={{ fontSize: 14, color: theme.textMuted }}>{m.duration || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7b. Investigations */}
            {clinicalData.lab_orders?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10.5, color: theme.purple, fontFamily: theme.mono, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Investigations Ordered
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {clinicalData.lab_orders.map((lab, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px',
                      background: urgBg[lab.urgency] || theme.surface,
                      border: `1px solid ${urgColor[lab.urgency] || theme.border}28`,
                      borderLeft: `3px solid ${urgColor[lab.urgency] || theme.textDim}`,
                      borderRadius: 9,
                    }}>
                      <span style={{ fontSize: 13.5, color: theme.text, fontWeight: 500, flex: 1 }}>{lab.test_name}</span>
                      {lab.reason && <span style={{ fontSize: 12, color: theme.textDim, flex: 1 }}>{lab.reason}</span>}
                      <span style={{
                        padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: `${urgColor[lab.urgency] || theme.textMuted}18`,
                        color: urgColor[lab.urgency] || theme.textMuted,
                        border: `1px solid ${urgColor[lab.urgency] || theme.textMuted}35`,
                        fontFamily: theme.mono, letterSpacing: '0.05em', textTransform: 'uppercase',
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>{lab.urgency || 'routine'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7c. Follow-up & Advice */}
            {(clinicalData.follow_up?.timeframe || clinicalData.advice?.length > 0) && (
              <div>
                <div style={{ fontSize: 10.5, color: theme.purple, fontFamily: theme.mono, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Follow-up &amp; Advice
                </div>
                {clinicalData.follow_up?.timeframe && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 10.5, color: theme.textDim, fontFamily: theme.mono, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, flexShrink: 0 }}>Review after:</div>
                    <span style={{
                      padding: '5px 14px', borderRadius: 20,
                      background: `${theme.accent}14`, border: `1px solid ${theme.accent}35`,
                      color: theme.accent, fontSize: 14, fontWeight: 700,
                    }}>{clinicalData.follow_up.timeframe}</span>
                    {clinicalData.follow_up.instructions && (
                      <span style={{ fontSize: 13, color: theme.textMuted }}>{clinicalData.follow_up.instructions}</span>
                    )}
                  </div>
                )}
                {clinicalData.advice?.length > 0 && (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {clinicalData.advice.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: theme.accent, flexShrink: 0, fontSize: 14, marginTop: 2 }}>›</span>
                        <span style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.55 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>{/* end proforma body */}
        </div>{/* end main col */}

        {/* ══════════════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════════════ */}
        <aside style={{ position: 'sticky', top: 68, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Patient card */}
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Patient on record</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, letterSpacing: '-0.02em', marginBottom: 3 }}>{intake.name || '—'}</div>
            <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 4 }}>
              {intake.age && `${intake.age}y`}{intake.age && intake.gender && ' · '}{intake.gender && intake.gender.charAt(0).toUpperCase() + intake.gender.slice(1)}
            </div>
            {intake.abhaId && (
              <div style={{ fontFamily: theme.mono, fontSize: 10.5, color: theme.textDim }}>ABHA · {intake.abhaId}</div>
            )}
            {intake.allergies && (
              <div style={{ marginTop: 10, padding: '7px 10px', background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 8, fontSize: 12, color: theme.warning, fontWeight: 600 }}>
                ⚠ {intake.allergies}
              </div>
            )}
          </div>

          {/* Review checklist */}
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, color: theme.accent, fontFamily: theme.mono, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Review checklist</div>
            <div style={{ display: 'grid', gap: 9 }}>
              {checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 99, flexShrink: 0,
                    background: c.ok ? theme.accent : 'transparent',
                    border: `1.5px solid ${c.ok ? theme.accent : theme.border}`,
                    display: 'grid', placeItems: 'center',
                    color: theme.accentInk, fontSize: 10, fontWeight: 800,
                  }}>{c.ok ? '✓' : ''}</span>
                  <span style={{ fontSize: 12.5, color: c.ok ? theme.text : theme.textDim }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsibles: transcript + FHIR */}
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <button onClick={() => setShowTranscript(s => !s)} style={{
              width: '100%', padding: '12px 16px', background: 'none', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
              borderBottom: showTranscript ? `1px solid ${theme.border}` : 'none',
            }}>
              <span style={{ fontSize: 12.5, color: theme.textMuted, fontWeight: 500 }}>Raw transcript</span>
              <span style={{ color: theme.textDim, fontSize: 15, transform: showTranscript ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>⌄</span>
            </button>
            {showTranscript && (
              <div style={{ padding: '12px 16px', maxHeight: 200, overflowY: 'auto' }}>
                <p style={{ fontSize: 11.5, color: theme.textMuted, fontFamily: theme.mono, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {clinicalData.raw_transcript || '—'}
                </p>
              </div>
            )}
            {fhirBundle && (
              <>
                <button onClick={() => setShowFhir(s => !s)} style={{
                  width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                  borderTop: `1px solid ${theme.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                  borderBottom: showFhir ? `1px solid ${theme.border}` : 'none',
                }}>
                  <span style={{ fontSize: 12.5, color: theme.textMuted, fontWeight: 500 }}>FHIR R4 Bundle</span>
                  <span style={{ color: theme.textDim, fontSize: 15, transform: showFhir ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>⌄</span>
                </button>
                {showFhir && (
                  <div style={{ padding: '12px 16px', maxHeight: 240, overflowY: 'auto' }}>
                    <pre style={{ fontSize: 10, color: theme.textMuted, fontFamily: theme.mono, margin: 0, overflowX: 'auto' }}>
                      {JSON.stringify(fhirBundle, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Approve / Discard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={onApprove} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: theme.accent, color: theme.accentInk,
              fontSize: 14.5, fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer',
              boxShadow: `0 8px 24px -8px ${theme.accentGlow}`,
              transition: 'transform .15s, filter .15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none' }}
            >✓ Approve &amp; Save Note</button>
            <button onClick={onDiscard} style={{
              width: '100%', padding: '11px', borderRadius: 12,
              background: 'transparent', border: `1px solid ${theme.border}`,
              color: theme.textMuted, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
              transition: 'border-color .15s, color .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.danger; e.currentTarget.style.color = theme.danger }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
            >Discard</button>
            <p style={{ textAlign: 'center', fontSize: 10.5, color: theme.textDim, margin: 0, lineHeight: 1.5 }}>
              Nothing is saved until you approve.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ── Approved + ABDM Upload ─────────────────────────────────────────────────────

function PatientSummaryCard({ clinicalData, intake }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [summary, setSummary] = useState(null)
  const [waMsg, setWaMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [lang, setLang] = useState(intake.language === 'mixed' ? 'en' : intake.language)

  const generate = async (language) => {
    setStatus('loading')
    setSummary(null)
    setWaMsg('')
    try {
      const res = await fetch(`${API}/api/v1/summary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinical_data: clinicalData,
          patient_name: intake.name || 'there',
          language,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed')
      const data = await res.json()
      setSummary(data.summary)

      // Also fetch WhatsApp message
      const waRes = await fetch(`${API}/api/v1/summary/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinical_data: clinicalData,
          patient_name: intake.name || 'there',
          language,
        }),
      })
      if (waRes.ok) {
        const waData = await waRes.json()
        setWaMsg(waData.message || '')
      }
      setStatus('done')
    } catch (e) {
      setStatus('error')
    }
  }

  const handleLangChange = (e) => {
    const l = e.target.value
    setLang(l)
    generate(l)
  }

  const copyWhatsApp = () => {
    navigator.clipboard.writeText(waMsg).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  const summaryLangs = LANGUAGES.filter(l => l.code !== 'mixed')

  return (
    <div style={{
      background: 'rgba(94,191,163,0.03)', border: '1px solid rgba(94,191,163,0.15)',
      borderRadius: 14, padding: 20, marginBottom: 16, textAlign: 'left',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 18 }}>💬</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: theme.accent }}>Patient Summary</p>
            <p style={{ fontSize: 12, color: theme.textDim }}>Plain-language note to share with the patient</p>
          </div>
        </div>
        {status === 'idle' && (
          <Btn variant="ghost" onClick={() => generate(lang)} style={{ padding: '8px 18px', fontSize: 13 }}>
            Generate
          </Btn>
        )}
      </div>

      {status === 'idle' && (
        <p style={{ fontSize: 13, color: theme.textDim }}>
          Auto-generate a plain-language summary the patient can read or receive on WhatsApp.
        </p>
      )}

      {status === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
          <Spinner /> <span style={{ color: theme.textMuted, fontSize: 14 }}>Generating patient summary…</span>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p style={{ color: theme.danger, fontSize: 13, marginBottom: 8 }}>Could not generate summary.</p>
          <Btn variant="ghost" onClick={() => generate(lang)} style={{ padding: '7px 16px', fontSize: 12 }}>Retry</Btn>
        </div>
      )}

      {status === 'done' && summary && (
        <>
          {/* Language selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: theme.textDim, whiteSpace: 'nowrap' }}>Language:</label>
            <select value={lang} onChange={handleLangChange} style={{
              background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 7,
              padding: '5px 10px', fontSize: 13, color: theme.text, fontFamily: 'inherit', cursor: 'pointer',
            }}>
              {summaryLangs.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>

          {/* Greeting + What happened */}
          {summary.greeting && (
            <p style={{ fontSize: 14, color: theme.text, fontWeight: 500, marginBottom: 10, lineHeight: 1.6 }}>
              {summary.greeting}
            </p>
          )}
          {summary.what_happened && (
            <p style={{ fontSize: 14, color: theme.textMuted, marginBottom: 14, lineHeight: 1.7 }}>
              {summary.what_happened}
            </p>
          )}

          {/* Diagnoses */}
          {summary.diagnoses?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Conditions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {summary.diagnoses.map((d, i) => (
                  <div key={i} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 2 }}>{d.condition}</p>
                    <p style={{ fontSize: 13, color: theme.textMuted }}>{d.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medications */}
          {summary.medications?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Medicines</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {summary.medications.map((m, i) => (
                  <div key={i} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '9px 12px' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: theme.accent, marginBottom: 3 }}>💊 {m.name}</p>
                    <p style={{ fontSize: 13, color: theme.textMuted }}>{m.instructions}{m.duration ? ` · ${m.duration}` : ''}</p>
                    {m.with_food !== undefined && (
                      <p style={{ fontSize: 12, color: theme.textDim, marginTop: 2 }}>{m.with_food ? '🍽 Take after food' : 'Take on empty stomach'}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning signs */}
          {summary.warning_signs?.length > 0 && (
            <div style={{
              background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)',
              borderRadius: 8, padding: '10px 12px', marginBottom: 12,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: theme.warning, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>⚠ Come back if</p>
              <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {summary.warning_signs.map((s, i) => (
                  <li key={i} style={{ fontSize: 13, color: theme.textMuted, display: 'flex', gap: 8 }}>
                    <span style={{ color: theme.warning, flexShrink: 0 }}>•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up */}
          {summary.follow_up && (
            <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12 }}>
              <strong style={{ color: theme.text }}>Follow-up:</strong> {summary.follow_up}
            </p>
          )}

          {/* WhatsApp copy button */}
          {waMsg && (
            <button onClick={copyWhatsApp} style={{
              width: '100%', padding: '11px 0', borderRadius: 9, border: 'none',
              background: copied ? 'rgba(94,191,163,0.12)' : 'rgba(37,211,102,0.12)',
              color: copied ? theme.accent : '#128C7E',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}>
              {copied ? '✓ Copied!' : '📋 Copy WhatsApp Message'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function ApprovedScreen({ intake, encounterId, fhirBundle, clinicalData, onNewConsultation }) {
  const [abdmStatus, setAbdmStatus] = useState('idle') // idle | uploading | success | error | pending_creds
  const [abdmMessage, setAbdmMessage] = useState('')
  const [abdmDetails, setAbdmDetails] = useState(null)

  const uploadToABDM = async () => {
    setAbdmStatus('uploading')
    setAbdmMessage('')
    try {
      const res = await fetch(`${API}/api/v1/upload-abdm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: encounterId,
          fhir_bundle: fhirBundle,
          patient_name: intake.name,
          abha_id: intake.abhaId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')

      if (data.status === 'pending_credentials') {
        setAbdmStatus('pending_creds')
        setAbdmDetails(data)
      } else {
        setAbdmStatus('success')
        setAbdmMessage('Successfully uploaded to ABDM HIE.')
      }
    } catch (e) {
      setAbdmStatus('error')
      setAbdmMessage(e.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '32px 16px 48px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative', zIndex: 1, animation: 'fadeIn 0.5s ease both',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(94,191,163,0.08)',
            border: `2px solid ${theme.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 32,
            boxShadow: '0 0 40px rgba(94,191,163,0.15)',
            animation: 'bounce-in 0.5s cubic-bezier(0.4,0,0.2,1) both',
          }}>✓</div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: theme.text, marginBottom: 8 }}>Proforma Approved</h2>
          <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 6, lineHeight: 1.6 }}>
            OPD consultation note for <strong style={{ color: theme.text }}>{intake.name}</strong> is complete.
          </p>
          {encounterId && (
            <p style={{
              color: theme.textDim, fontSize: 12, fontFamily: "'DM Mono', monospace",
              marginBottom: 0, padding: '5px 12px',
              background: theme.surface, borderRadius: 8, display: 'inline-block',
              border: `1px solid ${theme.border}`,
            }}>{encounterId}</p>
          )}
        </div>

        {/* Patient summary */}
        {clinicalData && <PatientSummaryCard clinicalData={clinicalData} intake={intake} />}

        {/* ABDM Upload section */}
        <div style={{
          background: 'rgba(94,191,163,0.04)', border: '1px solid rgba(94,191,163,0.2)',
          borderRadius: 14, padding: '20px', marginBottom: 28, textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>🏛️</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: theme.accent }}>Ayushman Bharat Digital Mission</p>
              <p style={{ fontSize: 12, color: theme.textDim }}>Upload to ABDM Health Information Exchange (HIE)</p>
            </div>
          </div>

          {intake.abhaId ? (
            <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 14 }}>
              ABHA ID: <span style={{ color: theme.text, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{intake.abhaId}</span>
            </p>
          ) : (
            <p style={{ fontSize: 13, color: theme.warning, marginBottom: 14 }}>
              ⚠ No ABHA ID provided — patient must link their ABHA to consent to upload.
            </p>
          )}

          {abdmStatus === 'idle' && (
            <Btn variant="abdm" onClick={uploadToABDM} style={{ width: '100%', padding: '12px 0' }}>
              Upload to Ayushman (ABDM)
            </Btn>
          )}

          {abdmStatus === 'uploading' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 0' }}>
              <Spinner /> <span style={{ color: theme.textMuted, fontSize: 14 }}>Uploading to ABDM HIE…</span>
            </div>
          )}

          {abdmStatus === 'success' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.accent, fontSize: 14 }}>
              <span>✓</span> {abdmMessage}
            </div>
          )}

          {abdmStatus === 'error' && (
            <div>
              <p style={{ color: theme.danger, fontSize: 13, marginBottom: 10 }}>✕ {abdmMessage}</p>
              <Btn variant="abdm" onClick={uploadToABDM} style={{ width: '100%', padding: '10px 0', fontSize: 13 }}>
                Retry
              </Btn>
            </div>
          )}

          {abdmStatus === 'pending_creds' && abdmDetails && (
            <div>
              <p style={{ fontSize: 13, color: theme.warning, marginBottom: 10 }}>
                ⚠ {abdmDetails.message}
              </p>
              <p style={{ fontSize: 12, color: theme.textDim, marginBottom: 6 }}>FHIR resources ready: {abdmDetails.fhir_resource_count}</p>
              <p style={{ fontSize: 11, color: theme.textDim }}>Next steps:</p>
              <ul style={{ paddingLeft: 16, margin: '6px 0 0' }}>
                {abdmDetails.next_steps?.map((s, i) => (
                  <li key={i} style={{ fontSize: 11, color: theme.textDim, marginBottom: 3 }}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Btn onClick={onNewConsultation} style={{ width: '100%', padding: '14px 0', fontSize: 15 }}>
          + New Consultation
        </Btn>
      </div>
    </div>
  )
}

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(239,68,68,0.95)', backdropFilter: 'blur(12px)',
      color: '#fff', padding: '13px 20px', borderRadius: 12,
      fontSize: 14, fontWeight: 500, zIndex: 9999,
      maxWidth: 480, width: 'calc(100vw - 40px)',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(239,68,68,0.3)',
      animation: 'fadeIn 0.3s ease both',
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>✕</button>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

const EMPTY_INTAKE = {
  name: '', age: '', gender: '', abhaId: '',
  chiefComplaint: '', duration: '', severity: '', symptomsDetail: '',
  currentMedications: '', allergies: '', pastHistory: '',
  language: 'mixed', consentGiven: false,
}

export default function MedScribeApp() {
  const [introComplete, setIntroComplete] = useState(() => !!sessionStorage.getItem('ibus_intro'))
  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('ibus_intro', '1')
    setIntroComplete(true)
  }, [])

  const [screen, setScreen] = useState('home')
  const [error, setError] = useState('')
  const [intake, setIntake] = useState(EMPTY_INTAKE)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const analyserRef = useRef(null)
  const audioContextRef = useRef(null)

  const [clinicalData, setClinicalData] = useState(null)
  const [fhirBundle, setFhirBundle] = useState(null)
  const [encounterId, setEncounterId] = useState('')

  const showError = useCallback((msg) => {
    setError(msg)
    setTimeout(() => setError(''), 8000)
  }, [])

  // Start recording the consultation (doctor + patient conversation)
  const startConsultation = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.75
      audioContext.createMediaStreamSource(stream).connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const mimeType = getBestMimeType()
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      audioChunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mediaRecorderRef.current = mr
      mr.start(1000)
      setScreen('recording')
    } catch {
      showError('Microphone access denied. Please allow microphone access and try again.')
    }
  }, [showError])

  const stopAndProcess = useCallback(async () => {
    const mr = mediaRecorderRef.current
    if (!mr) return
    setScreen('processing')

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      analyserRef.current = null
    }

    await new Promise(resolve => {
      mr.onstop = resolve
      mr.stop()
      mr.stream.getTracks().forEach(t => t.stop())
    })

    const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' })
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1]
      try {
        const res = await fetch(`${API}/api/v1/encounter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio_b64: base64,
            language: intake.language,
            patient_name: intake.name,
            patient_age: intake.age,
            patient_gender: intake.gender,
            abha_id: intake.abhaId,
            chief_complaint: intake.chiefComplaint,
            symptom_duration: intake.duration,
            symptom_severity: intake.severity,
            symptoms_detail: intake.symptomsDetail,
            current_medications: intake.currentMedications,
            known_allergies: intake.allergies,
            past_history: intake.pastHistory,
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
          throw new Error(err.detail || `Server error ${res.status}`)
        }
        const data = await res.json()
        setClinicalData(data.clinical_data)
        setFhirBundle(data.fhir_bundle)
        setEncounterId(data.encounter_id)
        setScreen('review')
      } catch (err) {
        showError(`Processing failed: ${err.message}`)
        setScreen('recording')
      }
    }
  }, [intake, showError])

  const handleNew = () => { setIntake(EMPTY_INTAKE); setScreen('intake') }
  const handleApprove = () => setScreen('approved')
  const handleDiscard = () => { setClinicalData(null); setFhirBundle(null); setEncounterId(''); setScreen('home') }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", background: theme.bg, minHeight: '100vh' }}>
      <GlobalStyles />
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <AnimatePresence>
        {!introComplete && <IntroScreen onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {screen === 'home' && <HomeScreen onNew={handleNew} />}

      {screen === 'intake' && (
        <PatientIntakeScreen
          intake={intake} setIntake={setIntake}
          onNext={startConsultation}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'recording' && (
        <ConsultationScreen
          onStop={stopAndProcess}
          intake={intake}
          analyser={analyserRef.current}
        />
      )}

      {screen === 'processing' && <ProcessingScreen />}

      {screen === 'review' && (
        <ProformaScreen
          clinicalData={clinicalData}
          fhirBundle={fhirBundle}
          encounterId={encounterId}
          intake={intake}
          onApprove={handleApprove}
          onDiscard={handleDiscard}
        />
      )}

      {screen === 'approved' && (
        <ApprovedScreen
          intake={intake}
          encounterId={encounterId}
          fhirBundle={fhirBundle}
          clinicalData={clinicalData}
          onNewConsultation={handleNew}
        />
      )}
    </div>
  )
}
