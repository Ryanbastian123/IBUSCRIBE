import { useState, useEffect, useRef } from 'react'

// ── Design Tokens (MedScribe dark) ───────────────────────────────────────────
const T = {
  bg: '#F5F2EA',
  surface: '#EFEBE1',
  surfaceHover: '#E8E3D7',
  card: '#FBF9F3',
  border: '#E2DCCE',
  accent: '#5EBFA3',
  accentSoft: '#86D4B8',
  accentInk: '#0F2A1F',
  accentDim: 'rgba(94,191,163,0.18)',
  accentGlow: 'rgba(94,191,163,0.38)',
  warning: '#D97706',
  danger: '#DC2626',
  text: '#1A2420',
  textMuted: '#5C6B65',
  textDim: '#8E9A94',
  blue: '#4B6FA8',
  purple: '#7A5CB0',
}
const FONT = "'DM Sans', 'Segoe UI', -apple-system, sans-serif"
const MONO = "'DM Mono', 'JetBrains Mono', ui-monospace, monospace"

// ── Global styles & keyframes ────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; }
      html, body, #root { margin:0; padding:0; background:${T.bg}; color:${T.text}; font-family:${FONT}; -webkit-font-smoothing:antialiased; }
      ::selection { background:${T.accentDim}; color:${T.accent}; }
      a { color:inherit; text-decoration:none; }
      button { font-family:inherit; cursor:pointer; border:0; background:none; color:inherit; }
      @keyframes fadeUp { from { opacity:0; transform: translateY(18px);} to { opacity:1; transform:none; } }
      @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
      @keyframes pulseGlow { 0%,100% { box-shadow:0 0 0 0 ${T.accentGlow};} 50% { box-shadow:0 0 0 14px rgba(94,191,163,0);} }
      @keyframes shimmer { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }
      @keyframes waveBar { 0%,100% { transform: scaleY(0.25);} 50% { transform: scaleY(1);} }
      .reveal { opacity:0; transform: translateY(18px); transition: opacity .7s ease, transform .7s ease; }
      .reveal.in { opacity:1; transform:none; }
      .grad-text { background: linear-gradient(90deg, #3B9B7C, ${T.accent} 55%, ${T.accentSoft}); -webkit-background-clip:text; background-clip:text; color:transparent; }
      .dot-grid { background-image: radial-gradient(${T.border} 1px, transparent 1px); background-size: 22px 22px; }
      .shine { background: linear-gradient(90deg, transparent, rgba(15,42,31,0.06), transparent); background-size: 200% 100%; animation: shimmer 2.4s linear infinite; }
    `}</style>
  )
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.12 })
    els.forEach(e => obs.observe(e))
    return () => obs.disconnect()
  }, [])
}

// ── Primitives ───────────────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', onClick, style, type, icon }) {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 13, borderRadius: 10 },
    md: { padding: '12px 20px', fontSize: 14, borderRadius: 12 },
    lg: { padding: '16px 28px', fontSize: 15, borderRadius: 14 },
  }
  const variants = {
    primary: { background: T.accent, color: '#0F2A1F', fontWeight: 600, boxShadow: `0 8px 24px -8px ${T.accentGlow}` },
    ghost: { background: 'transparent', color: T.text, border: `1px solid ${T.border}`, fontWeight: 500 },
    dark: { background: T.surfaceHover, color: T.text, border: `1px solid ${T.border}`, fontWeight: 500 },
  }
  const [hover, setHover] = useState(false)
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        letterSpacing: '-0.01em',
        transition: 'transform .18s ease, filter .18s ease, background .18s ease',
        transform: hover ? 'translateY(-1px)' : 'none',
        filter: hover ? 'brightness(1.05)' : 'none',
        ...sizes[size], ...variants[variant], ...style,
      }}>
      {children}
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
    </button>
  )
}

function Badge({ children, tone = 'accent' }) {
  const tones = {
    accent: { bg: T.accentDim, fg: T.accent, bd: 'rgba(94,191,163,0.3)' },
    blue: { bg: 'rgba(59,130,246,0.12)', fg: T.blue, bd: 'rgba(59,130,246,0.3)' },
    purple: { bg: 'rgba(139,92,246,0.12)', fg: T.purple, bd: 'rgba(139,92,246,0.3)' },
  }
  const t = tones[tone]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
    }}>{children}</span>
  )
}

const Container = ({ children, style }) => (
  <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
)

const SectionLabel = ({ children }) => (
  <div style={{ fontFamily: MONO, fontSize: 12, color: T.accent, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>{children}</div>
)
const SectionHeading = ({ children, style }) => (
  <h2 style={{ fontSize: 'clamp(32px, 4.4vw, 52px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: 0, fontWeight: 600, ...style }}>{children}</h2>
)
const SectionSub = ({ children }) => (
  <p style={{ color: T.textMuted, fontSize: 18, lineHeight: 1.6, maxWidth: 720, margin: '16px 0 0' }}>{children}</p>
)

// ── Nav ──────────────────────────────────────────────────────────────────────
function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, letterSpacing: '0.02em' }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`, display: 'grid', placeItems: 'center', color: '#0F2A1F', fontWeight: 800 }}>i</div>
      <span style={{ letterSpacing: '0.04em' }}>IBU<span style={{ color: T.accent }}>SCRIBE</span></span>
    </div>
  )
}

function Nav({ onNew, onOpenPricing }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const link = { color: T.textMuted, fontSize: 14, padding: '8px 4px', transition: 'color .15s', cursor: 'pointer' }
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(245,242,234,0.82)' : 'transparent',
      backdropFilter: scrolled ? 'saturate(140%) blur(12px)' : 'none',
      borderBottom: scrolled ? `1px solid ${T.border}` : '1px solid transparent',
      transition: 'all .25s ease',
    }}>
      <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <Brand />
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <a href="#how" style={link}>How it works</a>
          <a href="#use-cases" style={link}>Use cases</a>
          <button onClick={onOpenPricing} style={{ ...link, background: 'none' }}>Pricing</button>
          <a href="#faq" style={link}>FAQ</a>
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Btn variant="ghost" size="sm">Sign in</Btn>
          <Btn variant="primary" size="sm" onClick={onNew}>Start free trial</Btn>
        </div>
      </Container>
    </div>
  )
}

// ── Hero Visual (animated cards) ─────────────────────────────────────────────
function HeroVisual() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 3), 3400)
    return () => clearInterval(id)
  }, [])
  const cardBase = {
    position: 'absolute', inset: 0,
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 20, padding: 24,
    boxShadow: '0 30px 80px -40px rgba(26,36,32,0.18)',
    transition: 'opacity .7s ease, transform .7s ease',
  }
  return (
    <div style={{ position: 'relative', height: 440, width: '100%' }}>
      <div style={{ position: 'absolute', inset: -40, background: `radial-gradient(60% 60% at 50% 50%, ${T.accentDim}, transparent 70%)`, filter: 'blur(20px)' }} />
      {/* Card 1: Recording */}
      <div style={{ ...cardBase, opacity: step === 0 ? 1 : 0, transform: step === 0 ? 'scale(1)' : 'scale(.96)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Badge tone="accent"><span style={{ width: 8, height: 8, borderRadius: 99, background: T.danger, boxShadow: `0 0 0 0 ${T.danger}`, animation: 'pulseGlow 1.4s infinite' }} /> RECORDING</Badge>
          <span style={{ fontFamily: MONO, color: T.textMuted, fontSize: 13 }}>00:42</span>
        </div>
        <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8, fontFamily: MONO, letterSpacing: '0.1em' }}>LIVE TRANSCRIPT</div>
        <p style={{ color: T.text, fontSize: 15, lineHeight: 1.65, margin: 0 }}>
          "Patient आया है with complaint of <span style={{ color: T.accent }}>fever since 3 days</span>, body ache भी है... temperature <span style={{ color: T.accent }}>101.2</span>..."
        </p>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 60, marginTop: 24 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, background: T.accent, borderRadius: 2, height: '100%',
              transformOrigin: 'bottom',
              animation: `waveBar ${0.6 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite`,
              opacity: 0.85,
            }} />
          ))}
        </div>
      </div>
      {/* Card 2: Transcript chunks */}
      <div style={{ ...cardBase, opacity: step === 1 ? 1 : 0, transform: step === 1 ? 'scale(1)' : 'scale(.96)' }}>
        <Badge tone="blue">Transcribing · Whisper large-v3</Badge>
        <div style={{ marginTop: 22, display: 'grid', gap: 12 }}>
          {[
            { t: '0:00', txt: 'Namaste doctor, मुझे fever है 3 दिन से' },
            { t: '0:08', txt: 'And a headache... body pain भी है' },
            { t: '0:22', txt: 'Temp checked: 101.2 F. No cough, no breathing issue' },
            { t: '0:42', txt: 'I\'ll start you on Dolo 650, paracetamol, three times a day' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: MONO, color: T.textDim, fontSize: 12, minWidth: 36, paddingTop: 2 }}>{l.t}</span>
              <span style={{ color: T.text, fontSize: 14, lineHeight: 1.55 }}>{l.txt}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Card 3: Clinical note */}
      <div style={{ ...cardBase, opacity: step === 2 ? 1 : 0, transform: step === 2 ? 'scale(1)' : 'scale(.96)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <Badge tone="accent">✓ Clinical note ready</Badge>
          <span style={{ fontFamily: MONO, color: T.textMuted, fontSize: 12 }}>FHIR R4</span>
        </div>
        <div style={{ display: 'grid', gap: 14, fontSize: 14 }}>
          <Row label="Chief complaint" value="Fever × 3 days, body ache" />
          <Row label="Vitals" value="T 101.2 °F · no respiratory distress" accent />
          <Row label="Assessment" value="Viral fever · R50.9" />
          <Row label="Plan" value="Tab. Dolo 650 mg TDS × 5d · rest · review in 48h" accent />
        </div>
      </div>
    </div>
  )
}
function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'baseline', paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ color: T.textDim, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: MONO }}>{label}</div>
      <div style={{ color: accent ? T.accent : T.text }}>{value}</div>
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onNew }) {
  return (
    <section style={{ position: 'relative', paddingTop: 160, paddingBottom: 120, overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(1200px 500px at 20% -10%, ${T.accentDim}, transparent), radial-gradient(900px 500px at 95% 10%, rgba(134,212,184,0.22), transparent)` }} />
      <div aria-hidden className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.25, maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)' }} />
      <Container style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 64, alignItems: 'center' }}>
        <div className="reveal">
          <Badge tone="accent">🇮🇳 Built for Indian primary care</Badge>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.02, letterSpacing: '-0.035em', margin: '22px 0 20px', fontWeight: 600 }}>
            Your last 2 hours of daily paperwork, <span className="grad-text">done in 2 minutes.</span>
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: T.textMuted, maxWidth: 560, margin: 0 }}>
            MedScribe listens to your consultation, writes the clinical note, and builds an ABDM-ready FHIR record. You stay in control — review, edit, approve. Always.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            <Btn variant="primary" size="lg" onClick={onNew} icon={<span>→</span>}>Start free trial</Btn>
            <Btn variant="ghost" size="lg" icon={<span>▸</span>}>Watch 2-min demo</Btn>
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 36, color: T.textDim, fontSize: 13, flexWrap: 'wrap' }}>
            <TrustItem label="ABDM compliant" />
            <TrustItem label="FHIR R4 native" />
            <TrustItem label="8 Indian languages" />
            <TrustItem label="Works offline" />
          </div>
        </div>
        <div className="reveal"><HeroVisual /></div>
      </Container>
    </section>
  )
}
function TrustItem({ label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: T.accent, boxShadow: `0 0 10px ${T.accentGlow}` }} />
      {label}
    </span>
  )
}

// ── Problem ──────────────────────────────────────────────────────────────────
function Problem() {
  useReveal()
  const stats = [
    { n: '2–3 hrs', l: 'Spent on documentation daily', c: T.warning },
    { n: '#1', l: 'Cause of physician burnout in India', c: T.danger },
    { n: '40%', l: 'Of consultation time lost to typing', c: T.blue },
  ]
  return (
    <section style={{ padding: '120px 0', borderTop: `1px solid ${T.border}` }}>
      <Container>
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
          <SectionLabel>The problem</SectionLabel>
          <SectionHeading>You went to medical school to treat patients — <span style={{ color: T.textMuted }}>not to type notes.</span></SectionHeading>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 64 }}>
          {stats.map((s, i) => (
            <div key={i} className="reveal" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 32, transitionDelay: `${i * 80}ms` }}>
              <div style={{ fontSize: 54, fontWeight: 600, letterSpacing: '-0.03em', color: s.c, fontFamily: FONT }}>{s.n}</div>
              <div style={{ color: T.textMuted, marginTop: 8, fontSize: 15 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', t: 'Talk naturally', d: 'Hit record and consult. Hindi, English, Tamil, Kannada — or switch mid-sentence. MedScribe follows.', icon: '🎙️' },
    { n: '02', t: 'AI writes the note', d: 'In the time it takes to say goodbye to the patient, the clinical note is drafted — chief complaint, vitals, diagnosis, plan.', icon: '✨' },
    { n: '03', t: 'Review & approve', d: 'Scan, edit anything, approve. Nothing is saved until you say so. Ever.', icon: '✓' },
  ]
  return (
    <section id="how" style={{ padding: '120px 0' }}>
      <Container>
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 64px' }}>
          <SectionLabel>How it works</SectionLabel>
          <SectionHeading>Three steps. About two minutes. Done.</SectionHeading>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, position: 'relative' }}>
          {steps.map((s, i) => (
            <div key={i} className="reveal" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 32, position: 'relative', transitionDelay: `${i * 100}ms` }}>
              <div style={{ fontFamily: MONO, color: T.accent, fontSize: 13, letterSpacing: '0.16em', marginBottom: 18 }}>{s.n}</div>
              <div style={{ fontSize: 38, marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', margin: '0 0 10px', fontWeight: 600 }}>{s.t}</h3>
              <p style={{ color: T.textMuted, lineHeight: 1.6, margin: 0, fontSize: 15 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ── Use Cases ────────────────────────────────────────────────────────────────
const USE_CASES = {
  diabetes: {
    label: 'Diabetes',
    snippet: '"Sugar fasting 186 है, post-meal 248. Pichle 3 मही ne से HbA1c 8.4. Complaints of polyuria and nocturia. Fatigue भी है."',
    cc: 'Polyuria, nocturia, fatigue × 3 months',
    dx: 'Type 2 Diabetes Mellitus — uncontrolled',
    icd: 'E11.9',
    plan: 'Metformin SR 500mg BD · Glimepiride 1mg OD · HbA1c recheck 3 mo · diet counselling',
  },
  gastro: {
    label: 'Gastro',
    snippet: '"Epigastric pain, burning sensation, खाने के बाद बढ़ जाता है. Acidity is there since 2 weeks. No vomiting."',
    cc: 'Epigastric burning × 2 weeks, post-prandial aggravation',
    dx: 'Gastritis / functional dyspepsia',
    icd: 'K29.70',
    plan: 'Pan-D 40 mg OD × 14d · avoid NSAIDs · lifestyle advice · review if persists',
  },
  htn: {
    label: 'Hypertension',
    snippet: '"BP 158 by 96 today. Headache morning में होता है. Family history of hypertension है. No chest pain."',
    cc: 'Morning headaches, elevated BP (158/96)',
    dx: 'Essential Hypertension — Stage 1',
    icd: 'I10',
    plan: 'Amlodipine 5mg OD · home BP log × 2w · low salt diet · review in 2 weeks',
  },
  peds: {
    label: 'Pediatric',
    snippet: '"Bacche को fever है 2 दिन से, loose motions भी — 4–5 times. Weight 12 kg. No vomiting, feeds are okay."',
    cc: 'Fever × 2 days + loose stools × 2 days, child 12 kg',
    dx: 'Acute gastroenteritis with fever',
    icd: 'A09',
    plan: 'ORS sachets · Zinc syrup 20 mg OD × 14d · Cifran suspension per weight · review in 48h',
  },
}
function UseCases() {
  const [tab, setTab] = useState('diabetes')
  const uc = USE_CASES[tab]
  return (
    <section id="use-cases" style={{ padding: '120px 0', borderTop: `1px solid ${T.border}`, background: `linear-gradient(180deg, transparent, ${T.surface}, transparent)` }}>
      <Container>
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 48px' }}>
          <SectionLabel>Clinical use cases</SectionLabel>
          <SectionHeading>Trained on the visits you actually see.</SectionHeading>
          <SectionSub>Indian drug names, Indian disease prevalence, Indian code-switching. Not an American model with a translator bolted on.</SectionSub>
        </div>
        <div className="reveal" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {Object.entries(USE_CASES).map(([k, v]) => {
            const active = tab === k
            return (
              <button key={k} onClick={() => setTab(k)} style={{
                padding: '10px 18px', borderRadius: 999,
                background: active ? T.accent : T.card,
                color: active ? '#0F2A1F' : T.textMuted,
                border: `1px solid ${active ? T.accent : T.border}`,
                fontWeight: 500, fontSize: 14, transition: 'all .15s',
              }}>{v.label}</button>
            )
          })}
        </div>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Before */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 28 }}>
            <div style={{ fontFamily: MONO, color: T.textDim, fontSize: 11, letterSpacing: '0.18em', marginBottom: 14, textTransform: 'uppercase' }}>What the doctor heard</div>
            <p style={{ color: T.text, fontSize: 16, lineHeight: 1.75, margin: 0 }}>{uc.snippet}</p>
            <div style={{ marginTop: 28, padding: 16, border: `1px dashed ${T.border}`, borderRadius: 10, color: T.textDim, fontFamily: MONO, fontSize: 12.5, lineHeight: 1.7 }}>
              {'// Traditional scribble:\n// “fev 3d, dolo ×5d, rev\u00A048h”\n// Illegible · no codes · no structure'}
            </div>
          </div>
          {/* After */}
          <div style={{ background: T.card, border: `1px solid ${T.accent}`, borderRadius: 18, padding: 28, boxShadow: `0 20px 60px -40px ${T.accentGlow}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <Badge>MedScribe output</Badge>
              <span style={{ fontFamily: MONO, color: T.textMuted, fontSize: 12 }}>~11s</span>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <Row label="Chief complaint" value={uc.cc} />
              <Row label="Assessment" value={uc.dx} accent />
              <Row label="ICD-10" value={uc.icd} />
              <Row label="Plan" value={uc.plan} accent />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

// ── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const feats = [
    { i: '🇮🇳', t: 'Built for India', d: 'Dolo, Pan-D, Augmentin, Metformin SR. Indian drug naming, local disease prevalence, pharmacology we actually prescribe.' },
    { i: '🧑‍⚕️', t: 'Doctor stays in control', d: 'Nothing is saved, signed or pushed until you approve. The AI drafts — you decide. Every time.' },
    { i: '🔗', t: 'ABDM-native', d: 'FHIR R4 bundles generated from day one. Push to Health Information Exchange, ABHA linking included.' },
    { i: '🎧', t: 'Real-time transcription', d: 'Whisper large-v3 running on fast inference. You finish the visit, the transcript is already done.' },
    { i: '💊', t: 'Medication intelligence', d: 'Recognises dose schedules (BD, TDS, QID), duration (×5d), with-food instructions — in any language you speak them.' },
    { i: '📐', t: 'Structured from speech', d: 'Chief complaint, HPI, vitals, assessment, plan — all separated, all editable, all ready for EMR export.' },
  ]
  return (
    <section style={{ padding: '120px 0' }}>
      <Container>
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 64px' }}>
          <SectionLabel>Features</SectionLabel>
          <SectionHeading>Everything a primary care doctor in India actually needs.</SectionHeading>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {feats.map((f, i) => (
            <div key={i} className="reveal" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, transitionDelay: `${i * 60}ms` }}>
              <div style={{ fontSize: 30, marginBottom: 14 }}>{f.i}</div>
              <h3 style={{ fontSize: 18, margin: '0 0 8px', letterSpacing: '-0.01em', fontWeight: 600 }}>{f.t}</h3>
              <p style={{ color: T.textMuted, margin: 0, lineHeight: 1.6, fontSize: 14.5 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ── Metrics + Testimonials ───────────────────────────────────────────────────
function Metrics() {
  const metrics = [
    { n: '80%', l: 'Less time on documentation' },
    { n: '5,000+', l: 'Consultations processed' },
    { n: '~2 min', l: 'Average note turnaround' },
  ]
  const quotes = [
    { n: 'Dr. Priya Sharma', r: 'Family Physician · Bengaluru', q: 'I finish my last patient, I finish my notes. That’s it. I get my evenings back.' },
    { n: 'Dr. Rajesh Kumar', r: 'GP · Pune', q: 'The Hindi-English switching just works. I don’t adjust how I speak with patients anymore.' },
    { n: 'Dr. Anjali Mehta', r: 'Pediatrician · Mumbai', q: 'It knows Cifran syrup, it knows ORS and zinc. It speaks my pharmacology, not an American textbook.' },
  ]
  return (
    <section style={{ padding: '120px 0', borderTop: `1px solid ${T.border}`, background: T.surface }}>
      <Container>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 72 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div className="grad-text" style={{ fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{m.n}</div>
              <div style={{ color: T.textMuted, marginTop: 10 }}>{m.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {quotes.map((q, i) => (
            <figure key={i} className="reveal" style={{ margin: 0, background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, transitionDelay: `${i * 70}ms` }}>
              <blockquote style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: T.text }}>“{q.q}”</blockquote>
              <figcaption style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 99, background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`, display: 'grid', placeItems: 'center', color: '#0F2A1F', fontWeight: 600 }}>{q.n.split(' ')[1][0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{q.n}</div>
                  <div style={{ color: T.textDim, fontSize: 13 }}>{q.r}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ── Integration ──────────────────────────────────────────────────────────────
function Integration() {
  const steps = ['Record audio', 'Whisper STT', 'Clinical NLP', 'FHIR R4', 'Doctor review', 'Push to ABDM']
  return (
    <section style={{ padding: '120px 0' }}>
      <Container>
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 56px' }}>
          <SectionLabel>Integration & workflow</SectionLabel>
          <SectionHeading>Drops into your day. Plugs into the rails.</SectionHeading>
        </div>
        <div className="reveal" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 40 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', overflowX: 'auto' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
                <div style={{ padding: '12px 18px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, fontSize: 13, whiteSpace: 'nowrap' }}>
                  <span style={{ color: T.accent, fontFamily: MONO, marginRight: 8 }}>0{i + 1}</span>{s}
                </div>
                {i < steps.length - 1 && <span style={{ color: T.textDim }}>→</span>}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32 }}>
            {[
              { t: 'No new workflow', d: 'Consult exactly how you do today. Record in the background.' },
              { t: 'Offline-capable', d: 'Architecture designed for clinics with unreliable internet.' },
              { t: 'Under ₹10,000/mo', d: 'Infra target at 500 consultations/day. No DevOps team required.' },
            ].map((f, i) => (
              <div key={i} style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
                <div style={{ color: T.accent, fontSize: 13, fontFamily: MONO, marginBottom: 6, letterSpacing: '0.1em' }}>✓ {f.t.toUpperCase()}</div>
                <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.55 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

// ── Pricing ──────────────────────────────────────────────────────────────────
function PricingModal({ open, onClose, onNew }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])
  if (!open) return null
  const tiers = [
    { name: 'Free Trial', price: '₹0', sub: '30 days · 50 consultations', feat: ['All core features', 'WhatsApp summaries', '8 Indian languages', 'Email support'], cta: 'Start free', featured: false },
    { name: 'Professional', price: '₹4,999', sub: 'per doctor / month', feat: ['Unlimited consultations', 'ABDM & FHIR R4 export', 'PDF prescriptions', 'Priority support', 'Offline mode'], cta: 'Start 30-day trial', featured: true },
    { name: 'Enterprise', price: "Let's talk", sub: 'For clinics & hospitals', feat: ['Everything in Professional', 'Multi-doctor workspace', 'Custom integrations', 'HIS/EMR export', 'Dedicated onboarding'], cta: 'Contact sales', featured: false },
  ]
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(26,36,32,0.35)', backdropFilter: 'blur(10px)',
      display: 'grid', placeItems: 'center', padding: 24,
      animation: 'fadeIn .18s ease',
      overflowY: 'auto',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.bg, border: `1px solid ${T.border}`,
        borderRadius: 22, padding: 36, maxWidth: 1100, width: '100%',
        boxShadow: '0 50px 120px -40px rgba(26,36,32,0.30)',
        position: 'relative', animation: 'fadeUp .25s ease',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 18, right: 18,
          width: 36, height: 36, borderRadius: 10,
          background: T.card, border: `1px solid ${T.border}`,
          color: T.textMuted, fontSize: 20, display: 'grid', placeItems: 'center',
        }}>×</button>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>
          <SectionLabel>Pricing</SectionLabel>
          <SectionHeading style={{ fontSize: 'clamp(28px, 3.4vw, 40px)' }}>Honest pricing for Indian primary care.</SectionHeading>
          <p style={{ color: T.textMuted, fontSize: 16, lineHeight: 1.6, margin: '14px 0 0' }}>
            No per-minute billing. No surprise tokens. One flat monthly fee — the cost of a few lab tests.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {tiers.map((t, i) => (
            <div key={i} style={{
              background: t.featured ? `linear-gradient(180deg, ${T.card}, ${T.surface})` : T.card,
              border: `1px solid ${t.featured ? T.accent : T.border}`,
              borderRadius: 18, padding: 28, position: 'relative',
              boxShadow: t.featured ? `0 30px 80px -50px ${T.accentGlow}` : 'none',
            }}>
              {t.featured && <div style={{ position: 'absolute', top: -12, left: 22, background: T.accent, color: '#0F2A1F', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>MOST POPULAR</div>}
              <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 8 }}>{t.name}</div>
              <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 4 }}>{t.price}</div>
              <div style={{ color: T.textDim, fontSize: 13, marginBottom: 22 }}>{t.sub}</div>
              <Btn variant={t.featured ? 'primary' : 'dark'} size="md" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { onClose(); onNew && onNew() }}>{t.cta}</Btn>
              <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0 0', display: 'grid', gap: 10 }}>
                {t.feat.map((f, j) => (
                  <li key={j} style={{ display: 'flex', gap: 10, color: T.textMuted, fontSize: 14 }}>
                    <span style={{ color: T.accent }}>✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Security ─────────────────────────────────────────────────────────────────
function Security() {
  const pillars = [
    { i: '🛡️', t: 'Physician in the loop', d: 'Nothing saves, signs or transmits without explicit doctor approval. This is a hard architectural invariant.' },
    { i: '🔒', t: 'No invented clinical data', d: 'If it wasn\'t in the transcript, the model returns null. We never fabricate medications, diagnoses, or vitals.' },
    { i: '🇮🇳', t: 'Data stays in India', d: 'Built for ABDM from day one. Regional data residency, ABHA linking, consent-first architecture.' },
    { i: '🔐', t: 'Encrypted end-to-end', d: 'Audio and notes encrypted in transit and at rest. Audit logs for every view, edit and approval.' },
  ]
  return (
    <section style={{ padding: '120px 0' }}>
      <Container>
        <div className="reveal" style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 56px' }}>
          <SectionLabel>Safety & trust</SectionLabel>
          <SectionHeading>Patient safety isn't a feature. It's the architecture.</SectionHeading>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {pillars.map((p, i) => (
            <div key={i} className="reveal" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 32, display: 'grid', gridTemplateColumns: '56px 1fr', gap: 20 }}>
              <div style={{ fontSize: 32 }}>{p.i}</div>
              <div>
                <h3 style={{ fontSize: 18, margin: '0 0 8px', fontWeight: 600 }}>{p.t}</h3>
                <p style={{ color: T.textMuted, margin: 0, lineHeight: 1.6, fontSize: 14.5 }}>{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const qs = [
    { q: 'Does it understand Hindi-English code switching?', a: 'Yes — natively. Whisper large-v3 handles mid-sentence language mixing, and the clinical NLP is tuned for how Indian doctors actually speak in consultations.' },
    { q: 'What happens if the AI makes a mistake?', a: 'Nothing saves until you approve. The note is a draft — you can edit any field, add anything missing, or discard it entirely. The AI is never the final word.' },
    { q: 'Does it work offline?', a: 'The full offline mode ships in Phase 3. The architecture is already offline-capable: the app records and queues locally, syncing when connectivity returns.' },
    { q: 'Is it ABDM compliant?', a: 'Yes. Every consultation produces a FHIR R4 bundle from day one. ABHA linking and HIE push are supported in the Professional tier.' },
    { q: 'How much does it cost to run at 500 consultations/day?', a: 'Our infra target is under ₹10,000/month at that scale — that\'s why we use Groq for fast, affordable inference instead of self-hosting GPUs.' },
    { q: 'Can I export notes to my EMR?', a: 'Yes — FHIR R4 export works with most modern EMRs. We\'re also building direct integrations with common Indian clinic HIS systems in Phase 2.' },
  ]
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" style={{ padding: '120px 0', borderTop: `1px solid ${T.border}` }}>
      <Container style={{ maxWidth: 880 }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <SectionLabel>FAQ</SectionLabel>
          <SectionHeading>Questions doctors actually ask us.</SectionHeading>
        </div>
        <div className="reveal" style={{ display: 'grid', gap: 10 }}>
          {qs.map((it, i) => {
            const isOpen = open === i
            return (
              <div key={i} style={{ background: T.card, border: `1px solid ${isOpen ? T.accent : T.border}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s' }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: '100%', textAlign: 'left', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 500 }}>
                  <span>{it.q}</span>
                  <span style={{ color: T.accent, fontSize: 22, transition: 'transform .2s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {isOpen && <div style={{ padding: '0 24px 22px', color: T.textMuted, lineHeight: 1.65, fontSize: 15 }}>{it.a}</div>}
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

// ── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ onNew, onOpenPricing }) {
  return (
    <section style={{ padding: '140px 0 120px', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 60% at 50% 40%, ${T.accentDim}, transparent 70%)` }} />
      <Container style={{ position: 'relative', textAlign: 'center', maxWidth: 820 }}>
        <h2 className="reveal" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', letterSpacing: '-0.035em', lineHeight: 1.04, fontWeight: 600, margin: 0 }}>
          Give yourself back your <span className="grad-text">evenings.</span>
        </h2>
        <p className="reveal" style={{ color: T.textMuted, fontSize: 19, lineHeight: 1.6, marginTop: 20, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
          30 days free. 50 consultations. No credit card. Cancel whenever. Built by two people in Bengaluru who actually care.
        </p>
        <div className="reveal" style={{ display: 'inline-flex', gap: 12, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Btn variant="primary" size="lg" onClick={onNew} icon={<span>→</span>}>Start your free trial</Btn>
          <Btn variant="ghost" size="lg" onClick={onOpenPricing}>See pricing</Btn>
        </div>
      </Container>
    </section>
  )
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { h: 'Product', l: ['Features', 'Pricing', 'Use cases', 'Integrations'] },
    { h: 'Resources', l: ['Documentation', 'Clinical research', 'ABDM guide', 'Changelog'] },
    { h: 'Company', l: ['About', 'Blog', 'Contact', 'Careers'] },
    { h: 'Legal', l: ['Privacy', 'Terms', 'DPDP compliance', 'Security'] },
  ]
  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, background: T.surface, padding: '64px 0 32px' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr repeat(4, 1fr)', gap: 32 }}>
          <div>
            <div style={{ marginBottom: 14 }}><Brand /></div>
            <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
              Ambient AI clinical scribe, built in Bengaluru for Indian primary care.
            </p>
          </div>
          {cols.map((c, i) => (
            <div key={i}>
              <div style={{ fontSize: 12, color: T.textDim, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14, fontFamily: MONO }}>{c.h}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
                {c.l.map((x, j) => <li key={j}><a href="#" style={{ color: T.textMuted, fontSize: 14 }}>{x}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: T.textDim, fontSize: 13, flexWrap: 'wrap', gap: 10 }}>
          <div>© {new Date().getFullYear()} IBUSCRIBE · Bengaluru, India</div>
          <div style={{ fontFamily: MONO }}>Made with care for Indian doctors.</div>
        </div>
      </Container>
    </footer>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomeScreen({ onNew }) {
  useReveal()
  const [pricingOpen, setPricingOpen] = useState(false)
  const openPricing = () => setPricingOpen(true)
  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: FONT, minHeight: '100vh' }}>
      <GlobalStyles />
      <Nav onNew={onNew} onOpenPricing={openPricing} />
      <Hero onNew={onNew} />
      <Problem />
      <HowItWorks />
      <UseCases />
      <Features />
      <Metrics />
      <Integration />
      <Security />
      <FAQ />
      <FinalCTA onNew={onNew} onOpenPricing={openPricing} />
      <Footer />
      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} onNew={onNew} />
    </div>
  )
}
