import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Design Tokens — warm off-white × forest green ──────────────────────────
const T = {
  bg:           '#F7F5F1',
  surface:      '#EFEDE8',
  card:         '#FFFFFF',
  cardMid:      '#F3F1EC',
  cardHover:    '#EDEAE3',
  border:       'rgba(0,0,0,0.08)',
  borderMid:    'rgba(0,0,0,0.13)',
  borderAccent: 'rgba(5,150,105,0.28)',
  accent:       '#059669',
  accentSoft:   '#10B981',
  accentDeep:   '#047857',
  accentDim:    'rgba(5,150,105,0.08)',
  accentGlow:   'rgba(5,150,105,0.18)',
  accentInk:    '#FFFFFF',
  warning:      '#D97706',
  danger:       '#DC2626',
  text:         '#111827',
  textSecondary:'#374151',
  textMuted:    '#6B7280',
  textDim:      '#9CA3AF',
  blue:         '#2563EB',
  purple:       '#7C3AED',
}

const FONT  = "'Plus Jakarta Sans', 'DM Sans', 'Segoe UI', -apple-system, sans-serif"
const MONO  = "'DM Mono', 'JetBrains Mono', ui-monospace, monospace"
const GRAD_T = `linear-gradient(130deg, #047857 0%, #059669 50%, #10B981 100%)`

// ─── Global styles & keyframes ────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

      *, *::before, *::after { box-sizing: border-box; }
      html, body, #root {
        margin:0; padding:0;
        background:#F7F5F1; color:${T.text};
        font-family:${FONT}; -webkit-font-smoothing:antialiased; scroll-behavior:smooth;
      }
      ::selection { background:rgba(5,150,105,0.15); color:${T.accentDeep}; }
      a { color:inherit; text-decoration:none; }
      button { font-family:inherit; cursor:pointer; border:0; background:none; color:inherit; }

      /* Scroll reveals */
      .rv  { opacity:0; transform:translateY(32px) scale(0.985); transition:opacity .85s cubic-bezier(.16,1,.3,1), transform .85s cubic-bezier(.16,1,.3,1); }
      .rvl { opacity:0; transform:translateX(-32px);              transition:opacity .85s cubic-bezier(.16,1,.3,1), transform .85s cubic-bezier(.16,1,.3,1); }
      .rvr { opacity:0; transform:translateX(32px);               transition:opacity .85s cubic-bezier(.16,1,.3,1), transform .85s cubic-bezier(.16,1,.3,1); }
      .rv.in, .rvl.in, .rvr.in { opacity:1; transform:none; }

      /* Gradient text */
      .grad { background:${GRAD_T}; -webkit-background-clip:text; background-clip:text; color:transparent; }

      /* Grid background */
      .grid-bg {
        background-image:
          linear-gradient(rgba(5,150,105,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(5,150,105,0.06) 1px, transparent 1px);
        background-size:60px 60px;
      }

      /* Animations */
      @keyframes float3d {
        0%,100% { transform:perspective(1200px) rotateX(4deg) rotateY(-8deg) translateY(0px); }
        33%      { transform:perspective(1200px) rotateX(1deg) rotateY(-5deg) translateY(-14px); }
        66%      { transform:perspective(1200px) rotateX(7deg) rotateY(-11deg) translateY(-6px); }
      }
      @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(90px,-60px) scale(1.15)} 66%{transform:translate(-50px,70px) scale(.92)} }
      @keyframes orb2 { 0%,100%{transform:translate(0,0)}           33%{transform:translate(-70px,80px) scale(1.1)} 66%{transform:translate(60px,-50px) scale(1.06)} }
      @keyframes orb3 { 0%,100%{transform:translate(0,0) scale(1)}  50%{transform:translate(-60px,-80px) scale(1.12)} }
      @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      @keyframes shimmerLine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      @keyframes waveBar { 0%,100%{transform:scaleY(.14)} 50%{transform:scaleY(1)} }
      @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }
      @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
      @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
      @keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(5,150,105,.08)} 50%{box-shadow:0 0 60px rgba(5,150,105,.18)} }
      @keyframes waveDrift1 { 0%{transform:translateX(0) translateY(0)} 50%{transform:translateX(-80px) translateY(18px)} 100%{transform:translateX(0) translateY(0)} }
      @keyframes waveDrift2 { 0%{transform:translateX(0) translateY(0)} 50%{transform:translateX(60px) translateY(-14px)} 100%{transform:translateX(0) translateY(0)} }
      @keyframes waveDrift3 { 0%{transform:translateX(0) translateY(0)} 50%{transform:translateX(-40px) translateY(24px)} 100%{transform:translateX(0) translateY(0)} }
      @keyframes waveDrift4 { 0%{transform:translateX(0) translateY(0)} 50%{transform:translateX(70px) translateY(-20px)} 100%{transform:translateX(0) translateY(0)} }
      @keyframes waveDrift5 { 0%{transform:translateX(0) translateY(0)} 50%{transform:translateX(-55px) translateY(12px)} 100%{transform:translateX(0) translateY(0)} }
      @keyframes borderSpin {
        0%   { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }
      @keyframes iconPulse {
        0%,100% { transform:scale(1) rotate(0deg); }
        50%     { transform:scale(1.08) rotate(3deg); }
      }
      @keyframes contentIn {
        from { opacity:0; transform:translateY(-8px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes rippleOnce {
        0%   { transform:scale(0.4); opacity:.6; }
        100% { transform:scale(2.6); opacity:0; }
      }

      /* Shimmer accent text */
      .shimmer {
        background:linear-gradient(90deg,${T.accentDeep},${T.accent},${T.accentDeep});
        background-size:200% auto;
        -webkit-background-clip:text; background-clip:text; color:transparent;
        animation:shimmer 3s linear infinite;
      }

      /* Focus + scrollbar */
      button:focus-visible,a:focus-visible { outline:2px solid ${T.accent}; outline-offset:3px; border-radius:6px; }
      ::-webkit-scrollbar { width:6px; height:6px; }
      ::-webkit-scrollbar-track { background:${T.bg}; }
      ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.15); border-radius:6px; }
      ::-webkit-scrollbar-thumb:hover { background:rgba(0,0,0,0.25); }
    `}</style>
  )
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv,.rvl,.rvr')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.09, rootMargin: '0px 0px -40px 0px' })
    els.forEach(e => obs.observe(e))
    return () => obs.disconnect()
  }, [])
}

// ─── Animated Background ──────────────────────────────────────────────────────
function WaveLines() {
  // Each wave: a wide sinusoidal SVG path that drifts slowly
  const waves = [
    { d: 'M-200,180 C0,80 200,280 400,180 S800,80 1000,180 S1400,280 1600,180 S2000,80 2200,180', anim: 'waveDrift1', dur: '18s', opacity: 0.18, stroke: 2 },
    { d: 'M-200,320 C100,200 300,440 600,320 S1000,200 1200,320 S1600,440 1800,320 S2200,200 2400,320', anim: 'waveDrift2', dur: '24s', opacity: 0.13, stroke: 1.5 },
    { d: 'M-200,460 C150,340 350,580 650,460 S1050,340 1300,460 S1700,580 1950,460 S2300,340 2500,460', anim: 'waveDrift3', dur: '20s', opacity: 0.10, stroke: 1 },
    { d: 'M-200,600 C200,480 400,720 700,600 S1100,480 1400,600 S1800,720 2050,600 S2400,480 2600,600', anim: 'waveDrift4', dur: '28s', opacity: 0.15, stroke: 1.5 },
    { d: 'M-200,740 C100,620 300,860 600,740 S1000,620 1250,740 S1650,860 1900,740 S2250,620 2500,740', anim: 'waveDrift5', dur: '22s', opacity: 0.08, stroke: 1 },
    { d: 'M-200,100 C250,20  450,200 750,100  S1150,20  1400,100 S1800,200 2050,100 S2400,20  2600,100', anim: 'waveDrift2', dur: '30s', opacity: 0.12, stroke: 2 },
    { d: 'M-200,880 C200,760 400,1000 700,880 S1100,760 1350,880 S1750,1000 2000,880 S2350,760 2550,880', anim: 'waveDrift1', dur: '26s', opacity: 0.09, stroke: 1 },
  ]
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 1400 1000">
      {waves.map((w, i) => (
        <path
          key={i}
          d={w.d}
          fill="none"
          stroke="#059669"
          strokeWidth={w.stroke}
          strokeOpacity={w.opacity}
          style={{ animation: `${w.anim} ${w.dur} ease-in-out infinite`, animationDelay: `${i * -3.2}s` }}
        />
      ))}
    </svg>
  )
}

function AnimatedBg() {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Soft radial glow at top */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 45% at 50% -5%, rgba(5,150,105,0.07) 0%, transparent 70%)` }} />
      {/* Floating colour orbs */}
      <div style={{ position: 'absolute', width: 900, height: 900, top: '-22%', left: '-18%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 65%)', filter: 'blur(70px)', animation: 'orb1 26s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 700, height: 700, top: '28%', right: '-14%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'orb2 32s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 600, height: 600, bottom: '-12%', left: '28%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.04) 0%, transparent 65%)', filter: 'blur(50px)', animation: 'orb3 22s ease-in-out infinite' }} />
      {/* Wavy green lines */}
      <WaveLines />
      {/* Edge vignette to fade waves at borders */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 110% 110% at 50% 50%, transparent 45%, ${T.bg} 100%)`, opacity: 0.6 }} />
    </div>
  )
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', onClick, style, type, icon }) {
  const sizes = {
    sm: { padding: '9px 16px', fontSize: 13, borderRadius: 10 },
    md: { padding: '12px 22px', fontSize: 14, borderRadius: 12 },
    lg: { padding: '15px 30px', fontSize: 15.5, borderRadius: 14 },
  }
  const [h, setH] = useState(false)
  const base = { display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em', fontWeight: 600, transition: 'transform .2s ease, box-shadow .2s ease, background .2s ease, opacity .2s ease', transform: h ? 'translateY(-2px)' : 'none' }
  const variants = {
    primary: { background: T.accent, color: T.accentInk, boxShadow: h ? `0 14px 36px -10px ${T.accentGlow}` : `0 6px 20px -8px ${T.accentGlow}` },
    ghost:   { background: 'transparent', color: T.text, border: `1px solid ${T.borderMid}`, opacity: h ? 1 : 0.88 },
    dark:    { background: T.cardMid, color: T.text, border: `1px solid ${T.border}`, opacity: h ? 1 : 0.92 },
  }
  return (
    <button type={type || 'button'} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
    </button>
  )
}

function Badge({ children, tone = 'accent' }) {
  const tones = {
    accent: { bg: T.accentDim, fg: T.accent, bd: 'rgba(16,240,156,0.3)' },
    blue:   { bg: 'rgba(96,165,250,0.1)', fg: T.blue, bd: 'rgba(96,165,250,0.28)' },
    purple: { bg: 'rgba(167,139,250,0.1)', fg: T.purple, bd: 'rgba(167,139,250,0.28)' },
  }
  const c = tones[tone]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: c.bg, color: c.fg, border: `1px solid ${c.bd}`, fontSize: 12, fontWeight: 500, letterSpacing: '0.02em' }}>
      {children}
    </span>
  )
}

const Container = ({ children, style }) => (
  <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
)

const SectionLabel = ({ children }) => (
  <div style={{ fontFamily: MONO, fontSize: 11.5, color: T.accent, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>{children}</div>
)
const SectionHeading = ({ children, style }) => (
  <h2 style={{ fontSize: 'clamp(30px, 4.2vw, 52px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: 0, fontWeight: 700, color: T.accent, ...style }}>{children}</h2>
)
const SectionSub = ({ children }) => (
  <p style={{ color: T.textMuted, fontSize: 17.5, lineHeight: 1.65, maxWidth: 700, margin: '16px 0 0' }}>{children}</p>
)

function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12, alignItems: 'baseline', paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ color: T.textDim, fontSize: 11.5, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: MONO }}>{label}</div>
      <div style={{ color: accent ? T.accent : T.text, fontSize: 14, lineHeight: 1.5 }}>{value}</div>
    </div>
  )
}

// ─── ExpandCard — click-to-reveal card with rich animations ───────────────────
function ExpandCard({ icon, num, title, accentLine, children, delay = 0, compact = false }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [ripple, setRipple] = useState(null)
  const rippleId = useRef(0)

  const onClick = (e) => {
    // create ripple from click position
    const r = e.currentTarget.getBoundingClientRect()
    const id = ++rippleId.current
    setRipple({ x: e.clientX - r.left, y: e.clientY - r.top, id })
    setTimeout(() => setRipple(cur => (cur && cur.id === id ? null : cur)), 700)
    setOpen(o => !o)
  }

  return (
    <div
      className="rv"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: open
          ? `linear-gradient(155deg, ${T.cardMid} 0%, ${T.card} 100%)`
          : `linear-gradient(155deg, ${T.card} 0%, ${T.surface} 100%)`,
        border: `1px solid ${open ? T.accent : hover ? T.borderAccent : T.border}`,
        borderRadius: 20,
        padding: compact ? 22 : 28,
        cursor: 'pointer',
        transition: 'border-color .35s, transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s, background .35s',
        transitionDelay: `${delay}ms`,
        transform: hover && !open ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: open
          ? `0 28px 70px -24px ${T.accentGlow}, inset 0 0 0 1px rgba(16,240,156,0.12)`
          : hover
            ? `0 18px 46px -24px rgba(0,0,0,0.55)`
            : '0 0 0 rgba(0,0,0,0)',
        overflow: 'hidden',
      }}
    >
      {/* Gradient top line (shows on open) */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${T.accent} 50%, transparent 100%)`,
        backgroundSize: '200% 100%',
        animation: open ? 'shimmerLine 2.2s linear infinite' : 'none',
        opacity: open ? 1 : 0,
        transition: 'opacity .35s',
      }} />

      {/* Corner glow */}
      <div aria-hidden style={{
        position: 'absolute', top: -50, right: -50,
        width: 170, height: 170, borderRadius: '50%',
        background: T.accentDim,
        filter: 'blur(40px)',
        opacity: open ? 1 : hover ? 0.6 : 0.25,
        transition: 'opacity .35s',
      }} />

      {/* Click ripple */}
      {ripple && (
        <div aria-hidden key={ripple.id} style={{
          position: 'absolute',
          top: ripple.y, left: ripple.x,
          width: 160, height: 160, marginTop: -80, marginLeft: -80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`,
          animation: 'rippleOnce .6s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
          {num && (
            <div style={{
              fontFamily: MONO, color: T.accent, fontSize: 11.5,
              letterSpacing: '0.22em',
              padding: '5px 10px',
              background: T.accentDim,
              borderRadius: 7,
              border: `1px solid ${T.borderAccent}`,
              flexShrink: 0,
            }}>{num}</div>
          )}
          {icon && (
            <div style={{
              fontSize: 24, width: 48, height: 48,
              borderRadius: 14,
              background: open
                ? `linear-gradient(135deg, ${T.accent}, ${T.accentDeep})`
                : `linear-gradient(135deg, ${T.accentDim}, transparent)`,
              border: `1px solid ${open ? 'transparent' : T.borderAccent}`,
              display: 'grid', placeItems: 'center',
              flexShrink: 0,
              transition: 'transform .4s cubic-bezier(.16,1,.3,1), background .35s, border-color .35s',
              transform: open ? 'scale(1.08) rotate(-6deg)' : hover ? 'scale(1.04)' : 'scale(1)',
              animation: open ? 'iconPulse 2.4s ease-in-out infinite' : 'none',
              boxShadow: open ? `0 10px 30px -8px ${T.accentGlow}` : 'none',
            }}>{icon}</div>
          )}
          <h3 style={{
            fontSize: compact ? 15.5 : 17,
            margin: 0,
            letterSpacing: '-0.01em',
            fontWeight: 600,
            color: T.text,
            lineHeight: 1.3,
          }}>{title}</h3>
        </div>

        {/* Toggle button */}
        <div style={{
          width: 38, height: 38, borderRadius: 99,
          background: open ? T.accent : `${T.bg}`,
          color: open ? T.accentInk : T.textMuted,
          border: `1px solid ${open ? T.accent : T.borderMid}`,
          display: 'grid', placeItems: 'center',
          fontSize: 22, fontWeight: 300, lineHeight: 1,
          transition: 'all .4s cubic-bezier(.16,1,.3,1)',
          transform: open ? 'rotate(135deg) scale(1.05)' : 'rotate(0deg) scale(1)',
          flexShrink: 0,
          boxShadow: open ? `0 6px 16px -4px ${T.accentGlow}` : 'none',
        }}>+</div>
      </div>

      {/* Expanded content */}
      <div style={{
        maxHeight: open ? 520 : 0,
        opacity: open ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height .6s cubic-bezier(.16,1,.3,1), opacity .35s ease, margin-top .45s ease, padding-top .45s ease',
        marginTop: open ? 20 : 0,
        paddingTop: open ? 18 : 0,
        borderTop: open ? `1px solid ${T.border}` : '1px solid transparent',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ animation: open ? 'contentIn .5s ease both' : 'none', animationDelay: '0.1s' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── StatCard — click-to-reveal stat card ─────────────────────────────────────
function StatCard({ n, label, tone, tint, detail, delay = 0 }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [ripple, setRipple] = useState(null)
  const rippleId = useRef(0)

  const onClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const id = ++rippleId.current
    setRipple({ x: e.clientX - r.left, y: e.clientY - r.top, id })
    setTimeout(() => setRipple(cur => (cur?.id === id ? null : cur)), 700)
    setOpen(o => !o)
  }

  return (
    <div
      className="rv"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        background: open
          ? `linear-gradient(155deg, ${T.cardMid} 0%, ${T.card} 100%)`
          : `linear-gradient(155deg, ${T.card} 0%, ${T.surface} 100%)`,
        border: `1px solid ${open ? tone : hover ? T.borderMid : T.border}`,
        borderRadius: 20, padding: 36,
        cursor: 'pointer',
        transition: 'border-color .35s, transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s, background .35s',
        transitionDelay: `${delay}ms`,
        transform: hover && !open ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: open
          ? `0 28px 70px -24px ${tone}55, inset 0 0 0 1px ${tone}22`
          : hover ? `0 18px 46px -24px rgba(0,0,0,0.6)` : 'none',
      }}
    >
      {/* Shimmer top line */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${tone} 50%, transparent 100%)`,
        backgroundSize: '200% 100%',
        animation: open ? 'shimmerLine 2.2s linear infinite' : 'none',
        opacity: open ? 1 : 0,
        transition: 'opacity .35s',
      }} />

      {/* Tinted corner glow */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(80% 80% at 0% 0%, ${tint}, transparent 70%)`,
        opacity: open ? 1 : hover ? 0.6 : 0.4,
        transition: 'opacity .35s',
      }} />

      {/* Dot indicator */}
      <div style={{ position: 'absolute', top: 22, right: 22, width: 8, height: 8, borderRadius: 99, background: tone, boxShadow: `0 0 16px ${tone}` }} />

      {/* Click ripple */}
      {ripple && (
        <div aria-hidden key={ripple.id} style={{
          position: 'absolute', top: ripple.y, left: ripple.x,
          width: 200, height: 200, marginTop: -100, marginLeft: -100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tone}44 0%, transparent 70%)`,
          animation: 'rippleOnce .65s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ position: 'relative' }}>
        {/* Big stat number */}
        <div style={{
          fontSize: 62, fontWeight: 800, letterSpacing: '-0.04em',
          color: tone, lineHeight: 1, marginBottom: 16,
          transition: 'transform .4s cubic-bezier(.16,1,.3,1)',
          transform: open ? 'scale(0.9) translateY(-4px)' : 'scale(1)',
        }}>{n}</div>

        {/* Label + toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ color: T.textMuted, fontSize: 15, lineHeight: 1.5, flex: 1 }}>{label}</div>
          <div style={{
            width: 34, height: 34, borderRadius: 99, flexShrink: 0,
            background: open ? tone : T.bg,
            color: open ? T.accentInk : T.textMuted,
            border: `1px solid ${open ? tone : T.borderMid}`,
            display: 'grid', placeItems: 'center',
            fontSize: 20, lineHeight: 1,
            transition: 'all .4s cubic-bezier(.16,1,.3,1)',
            transform: open ? 'rotate(135deg) scale(1.05)' : 'none',
            boxShadow: open ? `0 6px 16px -4px ${tone}66` : 'none',
          }}>+</div>
        </div>

        {/* Revealed detail */}
        <div style={{
          maxHeight: open ? 180 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height .6s cubic-bezier(.16,1,.3,1), opacity .4s ease, margin-top .45s ease, padding-top .45s ease',
          marginTop: open ? 18 : 0,
          paddingTop: open ? 18 : 0,
          borderTop: open ? `1px solid ${T.border}` : '1px solid transparent',
        }}>
          <p style={{
            color: T.textSecondary, lineHeight: 1.7, margin: 0, fontSize: 14.5,
            animation: open ? 'contentIn .5s ease both' : 'none',
            animationDelay: '0.08s',
          }}>{detail}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Brand ────────────────────────────────────────────────────────────────────
function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Logomark: green box — speech bubble + ECG + pen */}
      <svg width="36" height="36" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="96" height="96" rx="22" fill="#059669"/>
        <path d="M16 24 C16 19 19.5 16 24 16 L72 16 C76.5 16 80 19 80 24 L80 60 C80 65 76.5 68 72 68 L50 68 L38 82 L38 68 L24 68 C19.5 68 16 65 16 60 Z"
              fill="rgba(255,255,255,0.14)" stroke="white" strokeWidth="2.8" strokeLinejoin="round"/>
        <polyline points="22,44 31,44 36,31 41,57 46,19 52,66 57,44 63,44 68,34 72,52 76,44 86,44"
                  fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
        <g transform="translate(78,18) rotate(42)">
          <rect x="-4" y="-14" width="8" height="20" rx="2.5" fill="white" opacity="0.92"/>
          <rect x="-4" y="-14" width="8" height="5" rx="2" fill="rgba(255,255,255,0.6)"/>
          <polygon points="0,9 -4,6 4,6" fill="rgba(255,255,255,0.65)"/>
          <circle cx="0" cy="10.5" r="1.5" fill="rgba(255,255,255,0.4)"/>
        </g>
      </svg>
      {/* Wordmark */}
      <span style={{ lineHeight: 1, userSelect: 'none', letterSpacing: 0 }}>
        <span style={{ fontSize: 15.5, fontWeight: 300, color: T.textMuted, letterSpacing: '0.04em', fontFamily: FONT }}>ibu</span><span style={{ fontSize: 15.5, fontWeight: 800, color: T.accent, letterSpacing: '-0.02em', fontFamily: FONT }}>scribe</span>
      </span>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onNew, onOpenPricing }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true }); fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const link = (href, label) => (
    <a href={href}
      style={{ color: T.textSecondary, fontSize: 14, padding: '8px 2px', cursor: 'pointer', transition: 'color .15s' }}
      onMouseEnter={e => { e.target.style.color = T.text }}
      onMouseLeave={e => { e.target.style.color = T.textSecondary }}>
      {label}
    </a>
  )
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(247,245,241,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'saturate(160%) blur(16px)' : 'none',
      borderBottom: scrolled ? `1px solid ${T.border}` : '1px solid transparent',
      transition: 'background .3s ease, border-color .3s ease, backdrop-filter .3s ease',
    }}>
      <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <Brand />
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {link('#how', 'How it works')}
          {link('#cases', 'Use cases')}
          <span onClick={onOpenPricing} style={{ color: T.textSecondary, fontSize: 14, padding: '8px 2px', cursor: 'pointer', transition: 'color .15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = T.text }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textSecondary }}>Pricing</span>
          {link('#faq', 'FAQ')}
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Btn variant="ghost" size="sm">Sign in</Btn>
          <Btn variant="primary" size="sm" onClick={onNew}>Start free trial</Btn>
        </div>
      </Container>
    </div>
  )
}

// ─── Hero Visual (3-step animated card) ───────────────────────────────────────
function HeroVisual({ tilt }) {
  const [step, setStep] = useState(0)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 3), 4200)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 80)
    return () => clearInterval(id)
  }, [])

  const floatStyle = tilt
    ? { transition: 'transform 0.18s ease', transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }
    : { animation: 'float3d 7s ease-in-out infinite' }

  const card = {
    position: 'absolute', inset: 0,
    background: '#FFFFFF',
    border: `1px solid rgba(0,0,0,0.09)`,
    borderRadius: 24, padding: '24px 26px',
    boxShadow: `0 32px 80px -24px rgba(0,0,0,0.13), 0 0 0 1px rgba(5,150,105,0.07), inset 0 1px 0 rgba(255,255,255,1)`,
    transition: 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)',
    overflow: 'hidden',
  }

  // Waveform heights — fixed so they don't re-render
  const barHeights = Array.from({ length: 38 }, (_, i) => 0.14 + Math.abs(Math.sin(i * 0.72)) * 0.86)

  return (
    <div style={{ position: 'relative', height: 500, width: '100%', ...floatStyle }}>
      {/* Ambient glow behind card */}
      <div style={{ position: 'absolute', inset: -50, background: `radial-gradient(55% 55% at 50% 50%, rgba(5,150,105,0.1), transparent 70%)`, filter: 'blur(24px)', animation: 'glow 5s ease-in-out infinite' }} />

      {/* ── CARD 1: LIVE RECORDING ── */}
      <div style={{ ...card, opacity: step === 0 ? 1 : 0, transform: step === 0 ? 'scale(1) translateY(0)' : 'scale(.97) translateY(10px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: 99, padding: '5px 12px' }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: '#DC2626', animation: 'pulseDot 1.2s infinite', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', letterSpacing: '0.1em', fontFamily: MONO }}>RECORDING</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: MONO, color: T.textMuted, fontSize: 13, fontWeight: 500 }}>01:24</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(220,38,38,0.07)', display: 'grid', placeItems: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 10 10"><rect width="10" height="10" rx="2" fill="#DC2626" opacity="0.8"/></svg>
            </div>
          </div>
        </div>

        {/* Patient chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: T.accentDim, border: `1px solid ${T.borderAccent}`, borderRadius: 12, marginBottom: 18 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>RK</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>Rajesh Kumar, 52 M</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>ABHA · 43-2891-7765-3302</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 10, color: T.accent, fontFamily: MONO, fontWeight: 600, letterSpacing: '0.06em' }}>OPD #047</div>
        </div>

        {/* Live transcript bubble */}
        <div style={{ background: T.surface, borderRadius: 14, padding: '14px 16px', marginBottom: 16, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: T.textDim, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Live Transcript</div>
          <p style={{ color: T.text, fontSize: 14.5, lineHeight: 1.75, margin: 0 }}>
            "Doc, I'm having{' '}
            <span style={{ background: 'rgba(5,150,105,0.1)', color: T.accent, borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>fever since 4 days</span>
            {', chills at night. Also '}
            <span style={{ background: 'rgba(5,150,105,0.1)', color: T.accent, borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>severe body ache</span>
            {'. Checked temp — '}
            <span style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>102.4 °F</span>
            {'…"}'}
          </p>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', gap: 2.5, alignItems: 'flex-end', height: 48, padding: '0 2px' }}>
          {barHeights.map((h, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: 3,
              background: `linear-gradient(to top, ${T.accent}, ${T.accentSoft})`,
              height: `${h * 100}%`,
              transformOrigin: 'bottom',
              animation: `waveBar ${0.5 + (i % 7) * 0.09}s ease-in-out ${i * 0.03}s infinite`,
              opacity: 0.7 + h * 0.3,
            }} />
          ))}
        </div>
      </div>

      {/* ── CARD 2: AI PROCESSING ── */}
      <div style={{ ...card, opacity: step === 1 ? 1 : 0, transform: step === 1 ? 'scale(1) translateY(0)' : 'scale(.97) translateY(10px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.18)', borderRadius: 99, padding: '5px 12px' }}>
            <svg width="10" height="10" viewBox="0 0 10 10" style={{ animation: 'pulseDot 1.4s infinite' }}><circle cx="5" cy="5" r="5" fill="#2563EB"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', letterSpacing: '0.1em', fontFamily: MONO }}>AI PROCESSING</span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: T.textMuted }}>Whisper large-v3</span>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'Speech-to-text', done: true, time: '0.8s' },
            { label: 'Clinical NLP extraction', done: true, time: '1.2s' },
            { label: 'SNOMED CT coding', done: true, time: '0.3s' },
            { label: 'FHIR R4 bundle build', done: false, time: '…' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: s.done ? 'rgba(5,150,105,0.05)' : T.surface, border: `1px solid ${s.done ? T.borderAccent : T.border}`, borderRadius: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: s.done ? T.accent : 'transparent', border: `1.5px solid ${s.done ? T.accent : T.borderMid}`, display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all .3s' }}>
                {s.done && <svg width="10" height="8" viewBox="0 0 10 8"><polyline points="1,4 4,7 9,1" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {!s.done && <div style={{ width: 6, height: 6, borderRadius: 99, background: T.borderMid, animation: 'pulseDot 1.1s infinite' }}/>}
              </div>
              <span style={{ fontSize: 13.5, color: s.done ? T.text : T.textMuted, flex: 1, fontWeight: s.done ? 500 : 400 }}>{s.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: s.done ? T.accent : T.textDim }}>{s.time}</span>
            </div>
          ))}
        </div>

        {/* Detected entities strip */}
        <div style={{ background: T.surface, borderRadius: 12, padding: '11px 14px', border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: T.textDim, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 9 }}>Detected Entities</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { t: 'Fever', c: T.accent }, { t: '102.4 °F', c: '#DC2626' }, { t: 'Body ache', c: T.accent },
              { t: 'Dengue screen', c: T.blue }, { t: 'Dolo 650 mg', c: T.purple }, { t: 'R50.9', c: T.textMuted },
            ].map((e, i) => (
              <span key={i} style={{ fontSize: 11.5, fontWeight: 500, color: e.c, background: `${e.c}14`, border: `1px solid ${e.c}30`, borderRadius: 6, padding: '3px 9px' }}>{e.t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CARD 3: CLINICAL NOTE READY ── */}
      <div style={{ ...card, opacity: step === 2 ? 1 : 0, transform: step === 2 ? 'scale(1) translateY(0)' : 'scale(.97) translateY(10px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(5,150,105,0.08)', border: `1px solid ${T.borderAccent}`, borderRadius: 99, padding: '5px 12px' }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#059669"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: '0.1em', fontFamily: MONO }}>NOTE READY · 2.3s</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 8, padding: '4px 9px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', fontFamily: MONO, letterSpacing: '0.08em' }}>FHIR R4</span>
          </div>
        </div>

        {/* Clinical rows */}
        <div style={{ display: 'grid', gap: 0, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
          {[
            { label: 'Patient', value: 'Rajesh Kumar · 52 M · ABHA verified', accent: false, icon: '👤' },
            { label: 'Chief Complaint', value: 'Fever × 4 days, chills, severe body ache', accent: false, icon: '🩺' },
            { label: 'Vitals', value: 'Temp 102.4 °F · PR 96/min · BP 128/82', accent: true, icon: '📊' },
            { label: 'Assessment', value: 'Viral fever, dengue suspected · R50.9', accent: true, icon: '🔬' },
            { label: 'Medications', value: 'Tab Dolo 650 mg TDS × 5d · ORS sachets', accent: false, icon: '💊' },
            { label: 'Follow-up', value: 'CBC + Dengue NS1 · Review in 48 hours', accent: false, icon: '📋' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '108px 1fr', borderBottom: i < 5 ? `1px solid ${T.border}` : 'none', background: r.accent ? 'rgba(5,150,105,0.04)' : '#fff' }}>
              <div style={{ padding: '9px 12px', borderRight: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12 }}>{r.icon}</span>
                <span style={{ fontSize: 10.5, color: T.textDim, fontFamily: MONO, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{r.label}</span>
              </div>
              <div style={{ padding: '9px 12px', fontSize: 12.5, color: r.accent ? T.accent : T.text, lineHeight: 1.4, fontWeight: r.accent ? 600 : 400 }}>{r.value}</div>
            </div>
          ))}
        </div>

        {/* Approve button */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: T.accent, borderRadius: 10, padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.02em', cursor: 'pointer', boxShadow: `0 6px 20px -8px ${T.accentGlow}` }}>
            ✓ Approve &amp; Save
          </div>
          <div style={{ width: 40, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke={T.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      {/* Step dots */}
      <div style={{ position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7, alignItems: 'center' }}>
        {[0,1,2].map(i => (
          <div key={i} onClick={() => setStep(i)} style={{ width: step === i ? 20 : 6, height: 6, borderRadius: 99, background: step === i ? T.accent : T.borderMid, transition: 'all .4s cubic-bezier(.16,1,.3,1)', cursor: 'pointer' }} />
        ))}
      </div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onNew }) {
  const mockupRef = useRef()
  const [tilt, setTilt] = useState(null)
  const onMouseMove = useCallback((e) => {
    if (!mockupRef.current) return
    const r = mockupRef.current.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) / (r.width / 2)
    const y = (e.clientY - r.top - r.height / 2) / (r.height / 2)
    setTilt({ x: -y * 9, y: x * 11 })
  }, [])
  const onMouseLeave = useCallback(() => setTilt(null), [])

  return (
    <section onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      style={{ position: 'relative', paddingTop: 164, paddingBottom: 140, overflow: 'hidden', zIndex: 1 }}>
      <Container style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'center' }}>
        <div className="rvl">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 999, background: T.accentDim, border: `1px solid ${T.borderAccent}`, marginBottom: 26, fontSize: 13, color: T.accent, fontWeight: 500 }}>
            <span style={{ animation: 'pulseDot 2.2s infinite', display: 'inline-block', width: 7, height: 7, borderRadius: 99, background: T.accent }} />
            Built for Indian primary care
          </div>
          <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', lineHeight: 1.04, letterSpacing: '-0.038em', margin: '0 0 22px', fontWeight: 700, color: T.accent }}>
            Your last 2 hours of paperwork,{' '}
            <span className="grad">done in&nbsp;2&nbsp;minutes.</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: T.textMuted, maxWidth: 530, margin: '0 0 36px' }}>
            IBUSCRIBE listens during your consultation, writes the clinical note, and builds an ABDM-ready FHIR record — in the time it takes to say goodbye to the patient.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
            <Btn variant="primary" size="lg" onClick={onNew} icon={<span>→</span>}>Start free trial</Btn>
            <Btn variant="ghost" size="lg">Watch 2-min demo</Btn>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['ABDM compliant', 'FHIR R4 native', '8 Indian languages', 'Works offline'].map(l => (
              <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: T.textDim, fontSize: 13 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: T.accent, flexShrink: 0 }} />{l}
              </span>
            ))}
          </div>
        </div>
        <div className="rvr">
          <div ref={mockupRef}>
            <HeroVisual tilt={tilt} />
          </div>
        </div>
      </Container>
    </section>
  )
}

// ─── Problem (click-to-reveal stat cards) ────────────────────────────────────
function Problem() {
  const stats = [
    {
      n: '2–3 hrs', l: 'Spent on documentation daily by each doctor',
      tone: T.warning, tint: 'rgba(251,191,36,0.09)',
      detail: 'Indian primary care doctors average 2–3 hours per day on documentation — SOAP notes, prescriptions, referral letters. At 50 patients a day, that\'s nearly 3 minutes of paperwork per patient that could be spent on actual medicine.',
    },
    {
      n: '#1', l: 'Cause of physician burnout in India',
      tone: T.danger, tint: 'rgba(248,113,113,0.09)',
      detail: 'Administrative burden — primarily documentation — is the leading cause of physician burnout across Indian public and private healthcare. It\'s not the patients. It\'s the paperwork that follows every single one of them.',
    },
    {
      n: '40%', l: 'Of consultation time lost to typing',
      tone: T.blue, tint: 'rgba(96,165,250,0.09)',
      detail: 'In a typical 5-minute consultation, nearly 2 minutes are spent looking at a screen instead of the patient. IBUSCRIBE returns that time — and the human connection it carries — back where it belongs.',
    },
  ]
  return (
    <section style={{ padding: '120px 0', position: 'relative', zIndex: 1, borderTop: `1px solid ${T.border}` }}>
      <Container>
        <div className="rv" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
          <SectionLabel>The problem</SectionLabel>
          <SectionHeading>You went to medical school to treat patients —<br /><span style={{ color: T.textMuted, fontWeight: 400 }}>not to type notes.</span></SectionHeading>
          <SectionSub>Click any card to see the full story.</SectionSub>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {stats.map((s, i) => (
            <StatCard key={i} n={s.n} label={s.l} tone={s.tone} tint={s.tint} detail={s.detail} delay={i * 100} />
          ))}
        </div>
      </Container>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const [active, setActive] = useState(0)

  const steps = [
    {
      n: '01', color: T.accent, colorDim: T.accentDim,
      label: 'Record',
      title: 'Just talk. ibuscribe listens.',
      desc: 'Tap record and consult as you always do. Hindi, English, Tamil, Kannada — or mid-sentence code-switching. ibuscribe follows every word, every drug name, every clinical detail without interrupting your flow.',
      tags: ['8 Indian languages', 'Background recording', 'No special hardware'],
      visual: (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: `1px solid ${T.border}`, boxShadow: '0 8px 24px -10px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 99, padding: '4px 12px' }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: '#DC2626', animation: 'pulseDot 1.2s infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', fontFamily: MONO, letterSpacing: '0.1em' }}>LIVE</span>
            </div>
            <span style={{ fontFamily: MONO, color: T.textMuted, fontSize: 12 }}>02:14</span>
          </div>
          <p style={{ fontSize: 13.5, color: T.text, lineHeight: 1.75, margin: '0 0 14px', fontStyle: 'italic' }}>
            "…<span style={{ color: T.accent, fontWeight: 600 }}>BP 152/94</span> today. Patient complains of <span style={{ color: T.accent, fontWeight: 600 }}>headache</span> since 3 days, <span style={{ color: '#DC2626', fontWeight: 600 }}>no chest pain</span>…"
          </p>
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 36 }}>
            {[0.3,0.7,0.5,1,0.6,0.9,0.4,0.8,0.5,0.7,0.3,0.6,0.9,0.4,0.7,0.5,1,0.6,0.8,0.3,0.7,0.9,0.5,0.6].map((h,i) => (
              <div key={i} style={{ flex: 1, borderRadius: 2, background: `linear-gradient(to top, ${T.accent}, ${T.accentSoft})`, height: `${h*100}%`, opacity: 0.65, animation: `waveBar ${0.5+(i%5)*0.1}s ease-in-out ${i*0.04}s infinite` }} />
            ))}
          </div>
        </div>
      ),
    },
    {
      n: '02', color: '#2563EB', colorDim: 'rgba(37,99,235,0.07)',
      label: 'Extract',
      title: 'AI reads the conversation, not you.',
      desc: 'In under 3 seconds, the clinical LLM extracts every relevant detail — symptoms, examination findings, diagnosis, medications, follow-up plan. If something wasn\'t mentioned, it\'s left blank. No hallucinations.',
      tags: ['Groq Llama 3 · 70B', 'SNOMED CT coded', 'ICD-10 assigned'],
      visual: (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid rgba(37,99,235,0.15)', boxShadow: '0 8px 24px -10px rgba(37,99,235,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: '#2563EB', animation: 'pulseDot 1.4s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', fontFamily: MONO, letterSpacing: '0.1em' }}>EXTRACTING</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: T.textDim, fontFamily: MONO }}>2.1s</span>
          </div>
          {[
            { l: 'Symptoms', v: 'Headache × 3d, elevated BP', c: T.text },
            { l: 'Vitals', v: 'BP 152/94 mmHg', c: '#DC2626' },
            { l: 'Assessment', v: 'Essential hypertension', c: '#2563EB' },
            { l: 'ICD-10', v: 'I10  ·  SNOMED 38341003', c: T.accent },
            { l: 'Plan', v: 'Amlodipine 5mg OD · BP log', c: T.text },
          ].map((r,i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: i<4 ? `1px solid ${T.border}` : 'none', alignItems: 'baseline' }}>
              <span style={{ fontSize: 10, fontFamily: MONO, color: T.textDim, minWidth: 72, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{r.l}</span>
              <span style={{ fontSize: 13, color: r.c, fontWeight: r.c !== T.text ? 600 : 400 }}>{r.v}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      n: '03', color: T.accent, colorDim: T.accentDim,
      label: 'Review',
      title: 'You approve. Nothing else moves.',
      desc: 'The complete clinical note lands on your screen. Read it, edit anything, add what\'s missing — then click Approve. Only then is anything saved or sent. The physician is always the final authority.',
      tags: ['Edit any field', 'One-click approval', 'Nothing auto-saves'],
      visual: (
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: `1px solid ${T.borderAccent}`, boxShadow: `0 8px 24px -10px ${T.accentGlow}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Clinical Note — Ready for Review</span>
            <span style={{ fontSize: 10, fontFamily: MONO, color: T.accent, background: T.accentDim, border: `1px solid ${T.borderAccent}`, borderRadius: 6, padding: '2px 8px' }}>FHIR R4</span>
          </div>
          {[
            { l: '👤 Patient', v: 'Rajan Pillai, 63 M' },
            { l: '🩺 Complaint', v: 'Headache × 3d, BP elevated' },
            { l: '📊 Vitals', v: 'BP 152/94 · PR 78/min' },
            { l: '🔬 Diagnosis', v: 'Essential Hypertension · I10' },
            { l: '💊 Rx', v: 'Amlodipine 5mg OD · review 2w' },
          ].map((r,i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: i<4 ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ fontSize: 12, color: T.textDim, minWidth: 100 }}>{r.l}</span>
              <span style={{ fontSize: 12.5, color: T.text, fontWeight: 500 }}>{r.v}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, background: T.accent, borderRadius: 10, padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.02em', boxShadow: `0 6px 18px -6px ${T.accentGlow}` }}>
            ✓ Approve &amp; Save to ABDM
          </div>
        </div>
      ),
    },
  ]

  return (
    <section id="how" style={{ padding: '120px 0', position: 'relative', zIndex: 1, borderTop: `1px solid ${T.border}` }}>
      <Container>
        {/* Header */}
        <div className="rv" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 72px' }}>
          <SectionLabel>How it works</SectionLabel>
          <SectionHeading>From consultation to clinical record<br />in three steps.</SectionHeading>
          <SectionSub>No forms. No typing. No reformatting. Just talk — ibuscribe handles everything in between.</SectionSub>
        </div>

        {/* Step selector pills */}
        <div className="rv" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 52 }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '10px 22px', borderRadius: 999, cursor: 'pointer',
              background: active === i ? s.color : '#fff',
              color: active === i ? '#fff' : T.textMuted,
              border: `1.5px solid ${active === i ? s.color : T.border}`,
              fontWeight: 600, fontSize: 14,
              transition: 'all .25s cubic-bezier(.16,1,.3,1)',
              boxShadow: active === i ? `0 8px 24px -8px ${s.color}55` : 'none',
              fontFamily: FONT,
            }}>
              <span style={{ fontFamily: MONO, fontSize: 10, opacity: 0.7, letterSpacing: '0.1em' }}>{s.n}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Main content grid */}
        {steps.map((s, i) => (
          <div key={i} className="rv" style={{
            display: active === i ? 'grid' : 'none',
            gridTemplateColumns: '1fr 1fr',
            gap: 56, alignItems: 'center',
            animation: 'contentIn .45s cubic-bezier(.16,1,.3,1)',
          }}>
            {/* Left — text */}
            <div>
              {/* Step number + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: s.colorDim, border: `1.5px solid ${s.color}44`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: s.color }}>{s.n}</span>
                </div>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${s.color}44, transparent)` }} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: s.color, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', background: s.colorDim, padding: '4px 12px', borderRadius: 99, border: `1px solid ${s.color}30` }}>{s.label}</span>
              </div>

              <h3 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.025em', color: s.color, margin: '0 0 18px' }}>{s.title}</h3>
              <p style={{ fontSize: 17, lineHeight: 1.72, color: T.textSecondary, margin: '0 0 28px' }}>{s.desc}</p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
                {s.tags.map((tag, ti) => (
                  <span key={ti} style={{ fontSize: 12.5, color: s.color, background: s.colorDim, border: `1px solid ${s.color}28`, borderRadius: 8, padding: '5px 13px', fontWeight: 500 }}>{tag}</span>
                ))}
              </div>

              {/* Step navigation dots */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {steps.map((_, di) => (
                  <button key={di} onClick={() => setActive(di)} style={{
                    width: active === di ? 28 : 8, height: 8, borderRadius: 99,
                    background: active === di ? s.color : T.borderMid,
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all .35s cubic-bezier(.16,1,.3,1)',
                  }} />
                ))}
                <span style={{ marginLeft: 8, fontSize: 12, color: T.textDim, fontFamily: MONO }}>{i + 1} / {steps.length}</span>
              </div>
            </div>

            {/* Right — visual card */}
            <div style={{ position: 'relative' }}>
              {/* Glow behind card */}
              <div style={{ position: 'absolute', inset: -30, background: `radial-gradient(60% 60% at 50% 50%, ${s.color}12, transparent 70%)`, filter: 'blur(20px)', borderRadius: 30 }} />
              <div style={{ position: 'relative', transform: 'perspective(900px) rotateY(-4deg) rotateX(2deg)', transition: 'transform .4s ease' }}>
                {s.visual}
                {/* Bottom shadow reflection */}
                <div style={{ position: 'absolute', bottom: -16, left: '10%', right: '10%', height: 24, background: `radial-gradient(ellipse at 50% 0%, ${s.color}18, transparent 70%)`, filter: 'blur(8px)' }} />
              </div>
            </div>
          </div>
        ))}

        {/* Bottom progress bar */}
        <div className="rv" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: 64, maxWidth: 600, margin: '64px auto 0' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <button onClick={() => setActive(i)} style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: active === i ? s.color : active > i ? T.accentDim : '#fff',
                border: `1.5px solid ${active >= i ? s.color : T.border}`,
                color: active === i ? '#fff' : active > i ? T.accent : T.textMuted,
                fontFamily: MONO, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all .3s ease',
                boxShadow: active === i ? `0 6px 20px -6px ${s.color}66` : 'none',
              }}>{active > i ? '✓' : s.n}</button>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, background: active > i ? `linear-gradient(to right, ${T.accent}, ${steps[i+1].color})` : T.border, transition: 'background .4s ease', margin: '0 4px' }} />
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ─── Use Cases ────────────────────────────────────────────────────────────────
const FOLDER_FONT = "'Georgia', 'Times New Roman', serif"
const USE_CASES = {
  diabetes: {
    label: 'Diabetes', icon: '🩸', color: '#D97706', colorDim: 'rgba(217,119,6,0.08)',
    patient: 'Suresh Nair, 58 M', opd: 'OPD #112', date: '12 May 2026',
    heard: 'Fasting sugar is 186 today, post-meal was 248 yesterday. HbA1c last checked 3 months ago — it was 8.4. Complaints of increased urination, especially at night. Also feeling very tired and thirsty all the time.',
    scribble: 'DM2 unc / MF SR 500 BD / Gli 1 OD / rev 3m',
    fields: [
      { l: 'Chief Complaint', v: 'Polyuria, polydipsia, fatigue × 3 months', hi: false },
      { l: 'Vitals', v: 'FBS 186 mg/dL · PPBS 248 mg/dL · HbA1c 8.4%', hi: true },
      { l: 'Assessment', v: 'Type 2 Diabetes Mellitus — uncontrolled', hi: true },
      { l: 'ICD-10 / SNOMED', v: 'E11.9  ·  44054006', hi: false },
      { l: 'Medications', v: 'Tab Metformin SR 500 mg BD after food\nTab Glimepiride 1 mg OD before breakfast', hi: false },
      { l: 'Follow-up', v: 'HbA1c recheck in 3 months · dietary counselling · foot exam', hi: false },
    ],
  },
  gastro: {
    label: 'Gastro', icon: '🫁', color: '#059669', colorDim: 'rgba(5,150,105,0.08)',
    patient: 'Meena Iyer, 34 F', opd: 'OPD #089', date: '12 May 2026',
    heard: 'Epigastric pain and burning since 2 weeks, gets worse right after eating. Acidity is there throughout the day. No vomiting, no blood. Taking antacids from pharmacy but only temporary relief.',
    scribble: 'Gastritis? Pan-D 40 OD 14d / avoid NSAID / rev 2w',
    fields: [
      { l: 'Chief Complaint', v: 'Epigastric burning + acidity × 2 weeks, post-prandial', hi: false },
      { l: 'Vitals', v: 'Abdomen soft · epigastric tenderness +', hi: true },
      { l: 'Assessment', v: 'Gastritis / Functional dyspepsia', hi: true },
      { l: 'ICD-10 / SNOMED', v: 'K29.70  ·  235595009', hi: false },
      { l: 'Medications', v: 'Tab Pan-D 40 mg OD before breakfast × 14 days\nAvoid NSAIDs, spicy food, late meals', hi: false },
      { l: 'Follow-up', v: 'Review in 2 weeks · endoscopy if no improvement', hi: false },
    ],
  },
  htn: {
    label: 'Hypertension', icon: '❤️', color: '#DC2626', colorDim: 'rgba(220,38,38,0.07)',
    patient: 'Rajan Pillai, 63 M', opd: 'OPD #054', date: '12 May 2026',
    heard: 'BP was 158 by 96 when I checked it this morning. Headache is there since a few days, mostly in the mornings. Family history — father had hypertension and a stroke. No chest pain or shortness of breath.',
    scribble: 'HTN St1 / Amlo 5 OD / BP log 2w / low salt',
    fields: [
      { l: 'Chief Complaint', v: 'Morning headaches × 1 week, elevated BP on home monitoring', hi: false },
      { l: 'Vitals', v: 'BP 158/96 mmHg · PR 78/min · No papilloedema', hi: true },
      { l: 'Assessment', v: 'Essential Hypertension — Stage 1', hi: true },
      { l: 'ICD-10 / SNOMED', v: 'I10  ·  38341003', hi: false },
      { l: 'Medications', v: 'Tab Amlodipine 5 mg OD morning\nLow-sodium diet · avoid alcohol', hi: false },
      { l: 'Follow-up', v: 'Home BP log twice daily × 2 weeks · renal function + lipid profile', hi: false },
    ],
  },
  peds: {
    label: 'Pediatric', icon: '👶', color: '#7C3AED', colorDim: 'rgba(124,58,237,0.07)',
    patient: 'Aryan Sharma, 4 Y M', opd: 'OPD #031', date: '12 May 2026',
    heard: 'Child has been having fever for 2 days, 101 to 102 degree. Loose motions also started yesterday — 4 to 5 times. Weight is 16 kg. No vomiting. Feeds are okay, he is drinking water. Urine output is normal.',
    scribble: 'AGE + fever / ORS / Zinc 20 OD 14d / Cifran susp wt',
    fields: [
      { l: 'Chief Complaint', v: 'Fever × 2 days (101–102 °F) + loose stools × 1 day (4–5 episodes)', hi: false },
      { l: 'Vitals', v: 'Weight 16 kg · Temp 101.6 °F · No dehydration · active', hi: true },
      { l: 'Assessment', v: 'Acute gastroenteritis with fever', hi: true },
      { l: 'ICD-10 / SNOMED', v: 'A09  ·  25374005', hi: false },
      { l: 'Medications', v: 'ORS sachets after each loose stool\nTab Zinc 20 mg OD × 14 days\nCiprofloxacin suspension per weight × 5 days', hi: false },
      { l: 'Follow-up', v: 'Return if no feeds, lethargy, or worsening stools · review in 48 hrs', hi: false },
    ],
  },
}

function UseCases() {
  const [tab, setTab] = useState('diabetes')
  const [prev, setPrev] = useState('diabetes')
  const uc = USE_CASES[tab]

  const switchTab = (k) => { setPrev(tab); setTab(k) }

  return (
    <section id="cases" style={{ padding: '120px 0', position: 'relative', zIndex: 1, borderTop: `1px solid ${T.border}`, background: `linear-gradient(180deg, transparent, rgba(5,150,105,0.035), transparent)` }}>
      <Container>
        {/* Header */}
        <div className="rv" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
          <SectionLabel>Clinical use cases</SectionLabel>
          <SectionHeading>Every consultation, structured in seconds.</SectionHeading>
          <SectionSub>Real Indian patients, real drug names, real disease patterns. ibuscribe is trained on how doctors in India actually speak and prescribe.</SectionSub>
        </div>

        {/* Folder with tabs */}
        <div className="rv" style={{ maxWidth: 980, margin: '0 auto' }}>

          {/* Folder tabs row */}
          <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', paddingLeft: 24 }}>
            {Object.entries(USE_CASES).map(([k, v], i) => {
              const active = tab === k
              return (
                <button key={k} onClick={() => switchTab(k)} style={{
                  padding: '10px 22px',
                  borderRadius: '10px 10px 0 0',
                  background: active ? '#FFFFFF' : `rgba(0,0,0,0.04)`,
                  color: active ? v.color : T.textMuted,
                  border: `1px solid ${active ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.07)'}`,
                  borderBottom: active ? '1px solid #FFFFFF' : `1px solid rgba(0,0,0,0.07)`,
                  fontWeight: active ? 700 : 500,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'all .2s ease',
                  marginRight: 3,
                  position: 'relative', zIndex: active ? 2 : 1,
                  transform: active ? 'translateY(1px)' : 'translateY(0)',
                  boxShadow: active ? '0 -4px 12px -4px rgba(0,0,0,0.06)' : 'none',
                  fontFamily: FONT,
                }}>
                  <span style={{ fontSize: 15 }}>{v.icon}</span>
                  {v.label}
                </button>
              )
            })}
          </div>

          {/* Folder body */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: '0 16px 16px 16px',
            boxShadow: '0 20px 60px -20px rgba(0,0,0,0.10), 0 4px 16px -8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            position: 'relative',
          }}>

            {/* Folder header bar */}
            <div style={{ background: `linear-gradient(135deg, ${uc.colorDim}, rgba(255,255,255,0))`, borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: uc.colorDim, border: `1px solid ${uc.color}28`, display: 'grid', placeItems: 'center', fontSize: 20 }}>{uc.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: FOLDER_FONT }}>{uc.patient}</div>
                  <div style={{ fontSize: 11.5, color: T.textMuted, marginTop: 2, fontFamily: MONO, letterSpacing: '0.06em' }}>{uc.opd} · {uc.date}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: 'rgba(5,150,105,0.08)', border: `1px solid ${T.borderAccent}`, borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: T.accent, fontFamily: MONO, letterSpacing: '0.08em' }}>FHIR R4</div>
                <div style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.18)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#2563EB', fontFamily: MONO, letterSpacing: '0.08em' }}>ABDM</div>
              </div>
            </div>

            {/* Two-column document body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr' }}>

              {/* LEFT — what was spoken */}
              <div style={{ padding: '28px 28px', borderRight: '1px solid rgba(0,0,0,0.07)', background: 'rgba(250,249,246,0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={T.textDim} strokeWidth="1.5"/><path d="M7 4v3l2 2" stroke={T.textDim} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: T.textDim, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: MONO }}>What ibuscribe heard</span>
                </div>

                {/* Transcript quote */}
                <div style={{ position: 'relative', paddingLeft: 16, marginBottom: 22 }}>
                  <div style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 3, borderRadius: 2, background: `linear-gradient(to bottom, ${uc.color}, ${uc.color}44)` }} />
                  <p style={{ fontFamily: FOLDER_FONT, fontSize: 15, lineHeight: 1.85, color: T.text, margin: 0, fontStyle: 'italic' }}>"{uc.heard}"</p>
                </div>

                {/* Old-style scribble */}
                <div style={{ marginTop: 'auto', padding: '14px 16px', background: 'rgba(0,0,0,0.025)', border: '1px dashed rgba(0,0,0,0.10)', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, fontFamily: MONO, color: T.textDim, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Before ibuscribe — traditional scribble</div>
                  <div style={{ fontFamily: FOLDER_FONT, fontSize: 14, color: T.textMuted, lineHeight: 1.6, fontStyle: 'italic' }}>{uc.scribble}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {['No ICD codes', 'No structure', 'Illegible'].map(t => (
                      <span key={t} style={{ fontSize: 10.5, color: T.danger, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 5, padding: '2px 8px', fontFamily: MONO }}>✗ {t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — structured clinical note */}
              <div style={{ padding: '28px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="2" stroke={T.accent} strokeWidth="1.5"/><path d="M5 5h4M5 8h3" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: T.accent, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: MONO }}>ibuscribe output</span>
                  </div>
                  <span style={{ fontSize: 11, color: T.textDim, fontFamily: MONO }}>~2.1s</span>
                </div>

                {/* Clinical rows */}
                <div style={{ display: 'grid', gap: 0, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, overflow: 'hidden' }}>
                  {uc.fields.map((f, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: i < uc.fields.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', background: f.hi ? `${uc.color}06` : '#fff' }}>
                      <div style={{ padding: '10px 14px', borderRight: '1px solid rgba(0,0,0,0.06)', background: f.hi ? `${uc.color}06` : 'rgba(0,0,0,0.015)' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: f.hi ? uc.color : T.textDim, fontFamily: MONO, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.4, display: 'block' }}>{f.l}</span>
                      </div>
                      <div style={{ padding: '10px 14px' }}>
                        <span style={{ fontFamily: FOLDER_FONT, fontSize: 13.5, color: f.hi ? uc.color : T.text, lineHeight: 1.55, fontWeight: f.hi ? 600 : 400, whiteSpace: 'pre-line' }}>{f.v}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer badges */}
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {['ICD-10 coded', 'SNOMED CT', 'Physician review required', 'FHIR R4 ready'].map(t => (
                    <span key={t} style={{ fontSize: 10.5, color: T.accent, background: T.accentDim, border: `1px solid ${T.borderAccent}`, borderRadius: 5, padding: '2px 8px', fontFamily: MONO }}>✓ {t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

// ─── Features — Hospital Folder UI ───────────────────────────────────────────
const FEAT_FONT = "'Georgia', 'Times New Roman', serif"

const FEATS = [
  {
    tab:    'Built for India',
    ref:    'IBU-IN-001',
    filed:  '12 May 2026',
    dept:   'Localisation & Pharmacology',
    color:  '#B45309',
    badge:  'VERIFIED',
    badgeColor: '#B45309',
    title:  'Tuned for Indian primary care — not translated from elsewhere.',
    body:   'Drug names, dosing schedules, and disease prevalence that match what you actually see in your OPD. Dolo 650, Pan-D, Augmentin 625, Metformin SR 500 — not "acetaminophen" or "omeprazole PO." Built from the ground up for the Indian formulary, with ICD-10-IN codes and SNOMED CT dual-coding.',
    keyPoints: ['Indian formulary (CIMS / MIMS-IN)', 'ICD-10-IN + SNOMED CT dual coding', 'Tanglish, Hinglish & regional code-switch', 'Mosquito-borne, TB, dengue prevalence weighting'],
    stamp: 'INDIA',
  },
  {
    tab:    'Doctor in Control',
    ref:    'IBU-DC-002',
    filed:  '12 May 2026',
    dept:   'Safety & Clinical Governance',
    color:  '#059669',
    badge:  'APPROVED',
    badgeColor: '#059669',
    title:  'The AI drafts. You decide. Nothing moves without your signature.',
    body:   'Every field is editable before it leaves your screen. No auto-save, no background push, no silent submission. The pipeline physically cannot push a FHIR bundle to the HIE without an explicit physician approval action. This is a hard architectural constraint — not a UI toggle that can be turned off.',
    keyPoints: ['No data leaves without explicit approval', 'All AI output editable before save', 'Full audit trail per consultation', 'DPDP & health data consent compliant'],
    stamp: 'APPROVED',
  },
  {
    tab:    'ABDM Native',
    ref:    'IBU-AB-003',
    filed:  '12 May 2026',
    dept:   'Interoperability & HIE',
    color:  '#2563EB',
    badge:  'FHIR R4',
    badgeColor: '#2563EB',
    title:  'FHIR R4 bundles — generated, not retrofitted.',
    body:   'Every encounter produces a FHIR R4 bundle from the first line of code — not bolted on as an export step. Patient, Encounter, Condition, MedicationRequest, and Observation resources are built inline. ABHA ID linking and consent-first HIE push are part of the core pipeline, ready for Phase 3 deployment.',
    keyPoints: ['FHIR R4 Condition + MedicationRequest + Observation', 'ABHA ID linking built in', 'Consent-first HIE push architecture', 'Regional data residency, DPDP-compliant'],
    stamp: 'FHIR R4',
  },
  {
    tab:    'Transcription',
    ref:    'IBU-TR-004',
    filed:  '12 May 2026',
    dept:   'Speech & Language',
    color:  '#7C3AED',
    badge:  'LIVE',
    badgeColor: '#7C3AED',
    title:  'You finish the consultation. The transcript is already done.',
    body:   'Groq-hosted Whisper large-v3 delivers near-real-time transcription — typically under 4 seconds for a 5-minute consultation. Handles mid-sentence code-switching between English, Hindi, Tamil, Telugu, Kannada, Bengali, Malayalam and Marathi. Noisy OPD backgrounds, multiple speakers, and accented speech are not edge cases — they\'re the training distribution.',
    keyPoints: ['Whisper large-v3 on Groq fast inference', '8 Indian languages + code-switching', 'Sub-4s for 5-min audio on fast network', 'Noise-robust for busy OPD settings'],
    stamp: 'LIVE',
  },
  {
    tab:    'Medications',
    ref:    'IBU-MR-005',
    filed:  '12 May 2026',
    dept:   'Prescription Intelligence',
    color:  '#DC2626',
    badge:  'VERIFIED',
    badgeColor: '#DC2626',
    title:  'Frequency, duration, instructions — extracted exactly as spoken.',
    body:   'The model recognises BD, TDS, QID, OD, SOS and less common schedules like ALTERNATE DAY and WEEKLY dosing. Duration suffixes — ×5d, ×14d, for 1 month — are captured and mapped. With-food, before-food, after-food and at-bedtime instructions are extracted verbatim in the language you speak them, then normalised for the prescription output.',
    keyPoints: ['BD / TDS / QID / OD / SOS / Weekly', 'Duration: ×5d, ×14d, for 1 month', 'Food instruction normalisation', 'Drug name fuzzy match (spelling variance)'],
    stamp: 'Rx',
  },
  {
    tab:    'Structured Output',
    ref:    'IBU-SO-006',
    filed:  '12 May 2026',
    dept:   'Clinical Documentation',
    color:  '#059669',
    badge:  'STRUCTURED',
    badgeColor: '#059669',
    title:  'Complaint → HPI → Assessment → Plan. Separated. Editable. Exportable.',
    body:   'Speech goes in as a single stream. What comes out is a fully separated SOAP-style note: chief complaint, history of presenting illness, examination findings, assessment, and management plan — each in its own field, each editable, each ready for EMR export, PDF prescription, or WhatsApp summary without reformatting or rewriting by hand.',
    keyPoints: ['SOAP-structured output (CC / HPI / A / P)', 'Every field individually editable', 'PDF prescription + WhatsApp summary', 'EMR-ready JSON (HL7 FHIR R4)'],
    stamp: 'SOAP',
  },
]

function FolderTab({ label, color }) {
  return (
    <div style={{ paddingLeft: 24 }}>
      <div style={{
        display: 'inline-block',
        fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
        padding: '8px 20px', borderRadius: '7px 7px 0 0',
        border: '1px solid rgba(0,0,0,0.09)', borderBottom: '1px solid #FDFCF8',
        background: '#FDFCF8', color: color || T.accent,
        marginBottom: '-1px', position: 'relative', zIndex: 2,
      }}>{label}</div>
    </div>
  )
}

function FolderClosedCover({ onClick, docType, coverTitle, fileCount, color, headerContent }) {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer' }}>
      <div style={{
        background: '#FDFCF8',
        border: '1px solid rgba(0,0,0,0.09)',
        borderRadius: '0 12px 12px 12px',
        boxShadow: '0 16px 56px -20px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        transition: 'box-shadow .2s ease, transform .2s ease',
      }}>
        {headerContent}
        {/* Cover body */}
        <div style={{ padding: '44px 40px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: T.textDim, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
              {docType}
            </div>
            <div style={{ fontFamily: FEAT_FONT, fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1.25, marginBottom: 8 }}>
              {coverTitle}
            </div>
            <div style={{ fontFamily: FEAT_FONT, fontSize: 13.5, color: T.textMuted, fontStyle: 'italic' }}>
              {fileCount}
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 32,
            fontFamily: FONT, fontSize: 13, fontWeight: 600, color: color || T.accent,
            padding: '10px 22px', borderRadius: 8,
            border: `1px solid ${color ? color + '35' : T.borderAccent}`,
            background: color ? color + '0D' : T.accentDim,
            userSelect: 'none',
          }}>
            Open folder
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke={color || T.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {/* Paper stack at bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '0 20px', marginBottom: 0 }}>
          {[18, 12, 6].map((inset, i) => (
            <div key={i} style={{
              height: 7, marginLeft: inset, marginRight: inset,
              background: i === 0 ? '#fff' : `rgba(240,238,233,${0.8 - i * 0.2})`,
              border: '1px solid rgba(0,0,0,0.07)', borderBottom: 'none',
              borderRadius: '3px 3px 0 0',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Features() {
  const [active, setActive] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const feat = FEATS[active]

  return (
    <section style={{ padding: '120px 0', position: 'relative', zIndex: 1 }}>
      <style>{`
        @keyframes pageFlip {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes folderOpen {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .feat-page { animation: pageFlip 0.28s ease forwards; }
        .folder-open { animation: folderOpen 0.3s cubic-bezier(.16,1,.3,1) forwards; }
      `}</style>
      <Container>
        {/* Header */}
        <div className="rv" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
          <SectionLabel>Features</SectionLabel>
          <SectionHeading>Everything a primary care doctor in India actually needs.</SectionHeading>
          <SectionSub>Click the folder to explore each specification.</SectionSub>
        </div>

        {/* Folder shell */}
        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>

          {!isOpen ? (
            <>
              <FolderTab label="Features" color={T.accent} />
              <FolderClosedCover
                onClick={() => setIsOpen(true)}
                docType="Clinical System Specifications"
                coverTitle="6 capabilities built for Indian primary care."
                fileCount="6 specifications inside — Built for India · ABDM-native · Transcription · Medications"
                color={T.accent}
                headerContent={
                  <div style={{ background: `linear-gradient(90deg, ${T.accent}18 0%, ${T.accent}08 100%)`, borderBottom: `2px solid ${T.accent}30`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ background: T.accent, color: '#fff', fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 4 }}>IBU-FEAT</div>
                      <div style={{ fontFamily: FEAT_FONT, fontSize: 12, color: T.textMuted, fontStyle: 'italic' }}>Dept: Product &amp; Engineering</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['FHIR R4', 'ABDM'].map(b => <span key={b} style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 3, border: `1px solid ${T.accent}40`, color: T.accent }}>{b}</span>)}
                    </div>
                  </div>
                }
              />
            </>
          ) : (
            <div className="folder-open">
              {/* Tabs row + close button */}
              <div style={{ display: 'flex', gap: 3, paddingLeft: 24, position: 'relative', zIndex: 2, alignItems: 'flex-end' }}>
                {FEATS.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                style={{
                  fontFamily: FONT, fontSize: 12.5, fontWeight: i === active ? 700 : 500,
                  padding: '9px 16px',
                  borderRadius: '8px 8px 0 0',
                  border: `1px solid ${i === active ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.07)'}`,
                  borderBottom: i === active ? '1px solid #FFFFFF' : `1px solid rgba(0,0,0,0.07)`,
                  background: i === active ? '#FFFFFF' : '#E8E4DA',
                  color: i === active ? f.color : T.textMuted,
                  cursor: 'pointer', outline: 'none',
                  transition: 'all .18s ease',
                  marginBottom: i === active ? '-1px' : 0,
                  position: 'relative', zIndex: i === active ? 3 : 1,
                  whiteSpace: 'nowrap',
                  boxShadow: i === active ? '0 -2px 8px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {f.tab}
              </button>
            ))}
                {/* Close button */}
                <button onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto', marginBottom: 4, fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#E8E4DA', color: T.textMuted, cursor: 'pointer' }}>✕ Close</button>
              </div>

              {/* Folder body — the "open folder" paper */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '0 12px 12px 12px',
            boxShadow: '0 8px 48px -12px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative', zIndex: 2, overflow: 'hidden',
          }}>
            {/* Folder header strip — coloured top bar */}
            <div style={{
              background: `linear-gradient(90deg, ${feat.color}18 0%, ${feat.color}08 100%)`,
              borderBottom: `2px solid ${feat.color}30`,
              padding: '16px 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* File label */}
                <div style={{
                  background: feat.color, color: '#fff',
                  fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                  padding: '3px 10px', borderRadius: 4,
                }}>
                  {feat.ref}
                </div>
                <div style={{ fontFamily: FEAT_FONT, fontSize: 12, color: T.textMuted, fontStyle: 'italic' }}>
                  Dept: {feat.dept}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: T.textDim }}>Filed: {feat.filed}</div>
                {/* FHIR + ABDM badges */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {['FHIR R4', 'ABDM'].map(b => (
                    <span key={b} style={{
                      fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                      padding: '2px 7px', borderRadius: 3,
                      border: `1px solid ${feat.color}40`, color: feat.color,
                    }}>{b}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Ruled paper content */}
            <div className="feat-page" key={active} style={{
              padding: '36px 40px 40px',
              backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.04) 28px)`,
              backgroundSize: '100% 28px',
              backgroundPositionY: '0px',
              minHeight: 360,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48 }}>

                {/* Left — typed document */}
                <div>
                  {/* Section heading */}
                  <div style={{ fontFamily: FEAT_FONT, fontSize: 11, color: T.textDim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Clinical System Specification
                  </div>
                  <h3 style={{
                    fontFamily: FEAT_FONT, fontSize: 22, fontWeight: 700,
                    color: T.text, lineHeight: 1.3, margin: '0 0 20px',
                    borderBottom: `1.5px solid ${feat.color}30`, paddingBottom: 14,
                  }}>
                    {feat.title}
                  </h3>
                  <p style={{
                    fontFamily: FEAT_FONT, fontSize: 15, lineHeight: 1.85,
                    color: T.textSecondary, margin: '0 0 28px', fontStyle: 'italic',
                  }}>
                    {feat.body}
                  </p>

                  {/* Key points — typed list */}
                  <div style={{ borderTop: `1px dashed rgba(0,0,0,0.12)`, paddingTop: 20 }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: T.textDim, letterSpacing: '0.1em', marginBottom: 12 }}>
                      KEY SPECIFICATIONS
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                      {feat.keyPoints.map((kp, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ color: feat.color, fontWeight: 700, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                          <span style={{ fontFamily: FEAT_FONT, fontSize: 13.5, color: T.textMuted, lineHeight: 1.5 }}>{kp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right — file card with stamp */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Patient file card */}
                  <div style={{
                    border: `1px solid rgba(0,0,0,0.1)`,
                    borderRadius: 10,
                    background: '#FDFCF9',
                    overflow: 'hidden',
                  }}>
                    {/* Card header */}
                    <div style={{
                      background: `${feat.color}12`,
                      borderBottom: `1px solid ${feat.color}25`,
                      padding: '10px 14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: feat.color, fontWeight: 700, letterSpacing: '0.08em' }}>
                        FEATURE CARD
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: T.textDim }}>{feat.ref}</span>
                    </div>
                    <div style={{ padding: '16px 14px' }}>
                      {[
                        { l: 'Module', v: feat.tab },
                        { l: 'Department', v: feat.dept.split(' & ')[0] },
                        { l: 'Status', v: 'Active — Phase 1' },
                        { l: 'Compliance', v: 'ABDM / FHIR R4' },
                      ].map((row, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                          borderBottom: i < 3 ? `1px solid rgba(0,0,0,0.06)` : 'none',
                          padding: '7px 0',
                        }}>
                          <span style={{ fontFamily: FEAT_FONT, fontSize: 11, color: T.textDim, fontStyle: 'italic' }}>{row.l}</span>
                          <span style={{ fontFamily: FEAT_FONT, fontSize: 12, color: T.textSecondary, fontWeight: 700, textAlign: 'right', maxWidth: 130 }}>{row.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rubber stamp */}
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                    <div style={{
                      border: `3px solid ${feat.badgeColor}`,
                      borderRadius: 8,
                      padding: '10px 20px',
                      transform: 'rotate(-4deg)',
                      opacity: 0.75,
                      display: 'inline-block',
                    }}>
                      <div style={{
                        fontFamily: FEAT_FONT, fontSize: 20, fontWeight: 700,
                        color: feat.badgeColor, letterSpacing: '0.14em',
                        textTransform: 'uppercase', lineHeight: 1,
                      }}>
                        {feat.badge}
                      </div>
                      <div style={{
                        fontFamily: MONO, fontSize: 8, color: feat.badgeColor,
                        letterSpacing: '0.12em', textAlign: 'center', marginTop: 3,
                      }}>
                        ibuscribe · {feat.filed}
                      </div>
                    </div>
                  </div>

                  {/* Feature index dots */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {FEATS.map((_, i) => (
                      <button key={i} onClick={() => setActive(i)} style={{
                        width: i === active ? 20 : 6, height: 6, borderRadius: 3,
                        background: i === active ? feat.color : 'rgba(0,0,0,0.12)',
                        border: 'none', cursor: 'pointer', padding: 0,
                        transition: 'all .2s ease',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Folder footer — ruled line + page ref */}
            <div style={{
              borderTop: `1px solid rgba(0,0,0,0.07)`,
              padding: '10px 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#FAFAF8',
            }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.textDim }}>
                ibuscribe Clinical System Documentation · Confidential
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.textDim }}>
                Page {active + 1} of {FEATS.length}
              </span>
            </div>
          </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

// ─── Rural — District Health Field Report Folder ──────────────────────────────
const RURAL_ITEMS = [
  { code: 'R-01', label: 'Offline-first',        status: 'ACTIVE',   statusColor: '#059669',
    d: 'Records while disconnected, syncs automatically when back online. Built for PHCs with patchy connectivity — not just metro clinics with fibre.' },
  { code: 'R-02', label: '8 regional languages', status: 'ACTIVE',   statusColor: '#059669',
    d: 'Hindi, Tamil, Telugu, Kannada, Bengali, Malayalam, Marathi, English — and mid-sentence code-switching, which is how Indian doctors actually speak.' },
  { code: 'R-03', label: 'NHM & ABDM aligned',   status: 'VERIFIED', statusColor: '#2563EB',
    d: 'Ayushman Bharat compliant from day one. ABHA linking, HIE push, and NHM reporting-ready. Built for the national stack, not around it.' },
  { code: 'R-04', label: 'High-volume ready',    status: 'ACTIVE',   statusColor: '#059669',
    d: 'Designed for 50–100 patients per day. PHC and CHC workflows, not just 20-patient private practice. Batched uploads, efficient queuing.' },
  { code: 'R-05', label: 'Low-cost hardware',    status: 'ACTIVE',   statusColor: '#059669',
    d: 'Runs on a ₹15,000 Android tablet or basic laptop. No GPU, no local model, no expensive server. The cloud does the heavy lifting.' },
  { code: 'R-06', label: 'Community health fit', status: 'ACTIVE',   statusColor: '#059669',
    d: 'Works alongside ASHA workers and ANMs. One doctor, many hands — the note still gets written, and the chain of care stays intact.' },
]

function Rural() {
  const [expanded, setExpanded] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const ruralHeader = (
    <div style={{ background: 'linear-gradient(90deg, #04553B 0%, #047857 55%, #059669 100%)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', display: 'grid', placeItems: 'center', fontFamily: FEAT_FONT, fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>भा</div>
        <div>
          <div style={{ fontFamily: FEAT_FONT, fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ministry of Health &amp; Family Welfare · ibuscribe</div>
          <div style={{ fontFamily: FEAT_FONT, fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 2 }}>Rural &amp; Semi-Urban Deployment — Field Assessment Report</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>REF: IBU/NHM/2026/004</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['NHM', 'ABDM', 'AYUSHMAN'].map(b => <span key={b} style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 3, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}>{b}</span>)}
        </div>
      </div>
    </div>
  )

  return (
    <section style={{ padding: '120px 0', position: 'relative', zIndex: 1, borderTop: `1px solid ${T.border}` }}>
      <style>{`
        @keyframes rowOpen {
          from { opacity: 0; max-height: 0; }
          to   { opacity: 1; max-height: 120px; }
        }
        .row-body { animation: rowOpen 0.24s ease forwards; overflow: hidden; }
      `}</style>
      <Container>
        <div className="rv" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 64px' }}>
          <SectionLabel>Rural &amp; Semi-Urban India</SectionLabel>
          <SectionHeading>Built for Bharat,<br />not just Bengaluru.</SectionHeading>
          <SectionSub>40% of India's doctors serve 70% of its population — at PHCs, CHCs, and district hospitals where the need is greatest and resources fewest.</SectionSub>
        </div>

        {/* District folder */}
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>

          {!isOpen ? (
            <>
              <FolderTab label="District Field Report" color={T.accent} />
              <FolderClosedCover
                onClick={() => setIsOpen(true)}
                docType="Ministry of Health & Family Welfare · ibuscribe"
                coverTitle="Built for Bharat, not just Bengaluru."
                fileCount="6 capabilities assessed — Offline-first · NHM aligned · 8 languages · PHC & CHC ready"
                color={T.accent}
                headerContent={ruralHeader}
              />
            </>
          ) : (
            <div className="folder-open">
              {/* Single tab + close */}
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingLeft: 32, gap: 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', padding: '8px 18px', borderRadius: '7px 7px 0 0', border: '1px solid rgba(0,0,0,0.09)', borderBottom: '1px solid #FDFCF8', background: '#FDFCF8', color: T.accent, marginBottom: '-1px', position: 'relative', zIndex: 2 }}>
                  District Field Report
                </div>
                <button onClick={() => setIsOpen(false)} style={{ marginLeft: 8, marginBottom: 4, fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#E8E4DA', color: T.textMuted, cursor: 'pointer' }}>✕ Close</button>
              </div>

          {/* Open folder */}
          <div style={{
            background: '#FDFCF8',
            border: '1px solid rgba(0,0,0,0.09)',
            borderRadius: '0 12px 12px 12px',
            boxShadow: '0 12px 56px -16px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>

            {/* Folder header — GOI-style document banner */}
            <div style={{
              background: 'linear-gradient(90deg, #04553B 0%, #047857 55%, #059669 100%)',
              padding: '18px 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Ashoka-style emblem placeholder */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.5)',
                  display: 'grid', placeItems: 'center',
                  fontFamily: FEAT_FONT, fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 700,
                }}>भा</div>
                <div>
                  <div style={{ fontFamily: FEAT_FONT, fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Ministry of Health &amp; Family Welfare · ibuscribe
                  </div>
                  <div style={{ fontFamily: FEAT_FONT, fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 2 }}>
                    Rural &amp; Semi-Urban Deployment — Field Assessment Report
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>REF: IBU/NHM/2026/004</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['NHM', 'ABDM', 'AYUSHMAN'].map(b => (
                    <span key={b} style={{
                      fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
                      padding: '2px 7px', borderRadius: 3,
                      background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}>{b}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Body — two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 420 }}>

              {/* Left — district stats sheet */}
              <div style={{
                borderRight: '1px solid rgba(0,0,0,0.07)',
                padding: '28px 24px',
                backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.035) 28px)`,
                backgroundSize: '100% 28px',
              }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.textDim, letterSpacing: '0.12em', marginBottom: 16 }}>
                  NATIONAL HEALTH INFRASTRUCTURE
                </div>

                {/* Stats */}
                {[
                  { n: '1,50,000+', l: 'Primary Health Centres', sub: 'Across 28 states & 8 UTs' },
                  { n: '25,000+',   l: 'Community Health Centres', sub: 'Block-level facilities' },
                  { n: '1 doctor',  l: 'Per 30,000 patients', sub: 'Rural practitioner load' },
                  { n: '40%',       l: 'Doctors serving 70% population', sub: 'Urban–rural disparity' },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: '12px 0',
                    borderBottom: i < 3 ? '1px dashed rgba(0,0,0,0.08)' : 'none',
                  }}>
                    <div style={{ fontFamily: FEAT_FONT, fontSize: 22, fontWeight: 700, color: T.accent, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{s.n}</div>
                    <div style={{ fontFamily: FEAT_FONT, fontSize: 13, color: T.text, fontWeight: 700, marginTop: 2 }}>{s.l}</div>
                    <div style={{ fontFamily: FEAT_FONT, fontSize: 11.5, color: T.textDim, fontStyle: 'italic', marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))}

                {/* Deployment stamp */}
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    border: `2px solid ${T.accent}`,
                    borderRadius: 6, padding: '8px 16px',
                    transform: 'rotate(-2deg)', opacity: 0.6,
                    display: 'inline-block', textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: FEAT_FONT, fontSize: 15, fontWeight: 700, color: T.accent, letterSpacing: '0.14em' }}>READY</div>
                    <div style={{ fontFamily: MONO, fontSize: 8, color: T.accent, letterSpacing: '0.1em', marginTop: 2 }}>BHARAT DEPLOYMENT</div>
                  </div>
                </div>
              </div>

              {/* Right — register / ledger rows */}
              <div>
                {/* Register column headers */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '72px 1fr 90px 32px',
                  padding: '10px 20px',
                  borderBottom: '1.5px solid rgba(0,0,0,0.1)',
                  background: '#F3F0E8',
                }}>
                  {['Ref No.', 'Capability', 'Status', ''].map((h, i) => (
                    <div key={i} style={{ fontFamily: MONO, fontSize: 9.5, color: T.textDim, letterSpacing: '0.1em', fontWeight: 700, textAlign: i === 2 ? 'center' : 'left' }}>{h}</div>
                  ))}
                </div>

                {/* Register rows */}
                {RURAL_ITEMS.map((item, i) => (
                  <div key={i} style={{ borderBottom: `1px solid rgba(0,0,0,0.06)` }}>
                    {/* Row */}
                    <div
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      style={{
                        display: 'grid', gridTemplateColumns: '72px 1fr 90px 32px',
                        padding: '14px 20px', cursor: 'pointer',
                        background: expanded === i ? `${T.accentDim}` : 'transparent',
                        transition: 'background .15s ease',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontFamily: MONO, fontSize: 10, color: T.textDim }}>{item.code}</div>
                      <div style={{ fontFamily: FEAT_FONT, fontSize: 14.5, fontWeight: 700, color: T.text }}>{item.label}</div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{
                          fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.08em',
                          padding: '3px 8px', borderRadius: 3,
                          background: `${item.statusColor}15`,
                          color: item.statusColor,
                          border: `1px solid ${item.statusColor}35`,
                        }}>{item.status}</span>
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: `1.5px solid rgba(0,0,0,0.13)`,
                        display: 'grid', placeItems: 'center',
                        color: T.textMuted, fontSize: 12, fontWeight: 700,
                        transition: 'transform .2s ease',
                        transform: expanded === i ? 'rotate(45deg)' : 'none',
                        background: expanded === i ? T.accent : 'transparent',
                        color: expanded === i ? '#fff' : T.textMuted,
                        justifySelf: 'center',
                      }}>+</div>
                    </div>

                    {/* Expanded description */}
                    {expanded === i && (
                      <div className="row-body" style={{
                        padding: '0 20px 16px 72px',
                        backgroundImage: `repeating-linear-gradient(transparent, transparent 23px, rgba(0,0,0,0.03) 24px)`,
                        backgroundSize: '100% 24px',
                      }}>
                        <p style={{ fontFamily: FEAT_FONT, fontStyle: 'italic', fontSize: 13.5, color: T.textSecondary, lineHeight: 1.8, margin: 0 }}>
                          {item.d}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Register footer */}
                <div style={{
                  padding: '10px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  background: '#F8F6F2',
                }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: T.textDim }}>
                    {RURAL_ITEMS.length} capabilities assessed · All systems ACTIVE
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: T.textDim }}>
                    Click any row to expand
                  </span>
                </div>
              </div>
            </div>

            {/* Folder footer */}
            <div style={{
              borderTop: '1px solid rgba(0,0,0,0.07)',
              padding: '10px 32px',
              background: '#F3F0E8',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: T.textDim }}>
                Government of India · Ministry of Health &amp; Family Welfare · ibuscribe Field Deployment Assessment
              </span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: T.textDim }}>CONFIDENTIAL · 2026</span>
            </div>
          </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

// ─── Pricing modal ────────────────────────────────────────────────────────────
function PricingModal({ open, onClose, onNew }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', fn) }
  }, [open, onClose])
  if (!open) return null
  const tiers = [
    { name: 'Free Trial',   price: '₹0',      sub: '30 days · 50 consultations', feat: ['All core features', 'WhatsApp summaries', '8 Indian languages', 'Email support'], cta: 'Start free', featured: false },
    { name: 'Professional', price: '₹4,999',  sub: 'per doctor / month',          feat: ['Unlimited consultations', 'ABDM & FHIR R4 export', 'PDF prescriptions', 'Priority support', 'Offline mode'], cta: 'Start 30-day trial', featured: true },
    { name: 'Enterprise',   price: "Let's talk", sub: 'For clinics & hospitals',  feat: ['Everything in Professional', 'Multi-doctor workspace', 'Custom integrations', 'HIS/EMR export', 'Dedicated onboarding'], cta: 'Contact sales', featured: false },
  ]
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(14px)', display: 'grid', placeItems: 'center', padding: 24, animation: 'fadeIn .18s ease', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 24, padding: 40, maxWidth: 1060, width: '100%', boxShadow: '0 60px 140px -40px rgba(0,0,0,0.7)', position: 'relative', animation: 'fadeUp .28s ease', maxHeight: '92vh', overflowY: 'auto' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 18, right: 18, width: 36, height: 36, borderRadius: 10, background: T.card, border: `1px solid ${T.border}`, color: T.textMuted, fontSize: 20, display: 'grid', placeItems: 'center' }}>×</button>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 36px' }}>
          <SectionLabel>Pricing</SectionLabel>
          <SectionHeading style={{ fontSize: 'clamp(26px, 3.2vw, 40px)' }}>Honest pricing for Indian primary care.</SectionHeading>
          <p style={{ color: T.textMuted, fontSize: 16, lineHeight: 1.6, margin: '14px 0 0' }}>No per-minute billing. No surprise tokens. One flat monthly fee — the cost of a few lab tests.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {tiers.map((t, i) => (
            <div key={i} style={{ background: t.featured ? T.cardMid : T.card, border: `1px solid ${t.featured ? T.accent : T.border}`, borderRadius: 20, padding: 30, position: 'relative', boxShadow: t.featured ? `0 0 60px -20px ${T.accentGlow}` : 'none' }}>
              {t.featured && <div style={{ position: 'absolute', top: -12, left: 22, background: T.accent, color: T.accentInk, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>MOST POPULAR</div>}
              <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 8 }}>{t.name}</div>
              <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>{t.price}</div>
              <div style={{ color: T.textDim, fontSize: 13, marginBottom: 22 }}>{t.sub}</div>
              <Btn variant={t.featured ? 'primary' : 'ghost'} size="md" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { onClose(); onNew && onNew() }}>{t.cta}</Btn>
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

// ─── Team — Personnel File Folder ─────────────────────────────────────────────
const TEAM = [
  {
    initials: 'MB',
    staffId: 'IBU-STAFF-001',
    name: 'Max Bastian',
    role: 'Founder',
    qual: 'MBBS · Bengaluru',
    dept: 'Clinical & Medical',
    joined: 'Jan 2025',
    clearance: 'CLINICAL',
    clearanceColor: '#059669',
    stat: '80+',
    statLabel: 'patients seen per day before ibuscribe',
    tags: ['Clinical Accuracy', 'ABDM Compliance', 'Indian Healthcare', 'OPD Workflows'],
    bio: 'Practicing physician who lived the documentation burden first-hand — 80 patients a day, two hours of notes after. Drives clinical accuracy, Indian healthcare context, and ABDM compliance across every decision in ibuscribe.',
    areas: [
      { l: 'Specialisation', v: 'Primary Care · OPD' },
      { l: 'Location',       v: 'Bengaluru, Karnataka' },
      { l: 'Focus',          v: 'Clinical Truth & Safety' },
      { l: 'Status',         v: 'Active — Full-time' },
    ],
  },
  {
    initials: 'RCB',
    staffId: 'IBU-STAFF-002',
    name: 'Ryan Chrisden Bastian',
    role: 'Co-Founder',
    qual: 'AI & Data Science Engineer',
    dept: 'Engineering & Product',
    joined: 'Jan 2025',
    clearance: 'ENGINEERING',
    clearanceColor: '#2563EB',
    stat: '100%',
    statLabel: 'of the stack — built from the ground up',
    tags: ['Clinical NLP', 'FHIR R4', 'Ambient AI', 'FastAPI · React'],
    bio: 'Built ibuscribe from the ground up — the ambient recording pipeline, clinical NLP, FHIR R4 builder, and the full-stack product. Obsessed with making AI genuinely useful where the need is greatest.',
    areas: [
      { l: 'Specialisation', v: 'AI / ML · Full-Stack' },
      { l: 'Location',       v: 'Bengaluru, Karnataka' },
      { l: 'Focus',          v: 'Pipeline & Product' },
      { l: 'Status',         v: 'Active — Full-time' },
    ],
  },
]

function Team() {
  const [isOpen, setIsOpen] = useState(false)

  const teamHeader = (
    <div style={{ background: 'linear-gradient(90deg, #111827 0%, #1E293B 100%)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accent, display: 'grid', placeItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 96 96" fill="none">
            <rect width="96" height="96" rx="22" fill="#059669"/>
            <path d="M16 24 C16 19 19.5 16 24 16 L72 16 C76.5 16 80 19 80 24 L80 60 C80 65 76.5 68 72 68 L50 68 L38 82 L38 68 L24 68 C19.5 68 16 65 16 60 Z" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="2.8" strokeLinejoin="round"/>
            <polyline points="22,44 31,44 36,31 41,57 46,19 52,66 57,44 63,44 68,34 72,52 76,44 86,44" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em' }}>ibuscribe · STAFF REGISTRY</div>
          <div style={{ fontFamily: FEAT_FONT, fontSize: 13, color: '#fff', fontWeight: 700, marginTop: 1 }}>Founding Team — Personnel Dossier</div>
        </div>
      </div>
      <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>REF: IBU/HR/2025/001</span>
    </div>
  )

  return (
    <section style={{ padding: '120px 0', position: 'relative', zIndex: 1, borderTop: `1px solid ${T.border}` }}>
      <Container>
        {/* Header */}
        <div className="rv" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 64px' }}>
          <SectionLabel>Who we are</SectionLabel>
          <SectionHeading>Two people. One mission.</SectionHeading>
          <SectionSub>A doctor and an engineer who believe the pen has outpaced the stethoscope for far too long.</SectionSub>
        </div>

        {/* Folder shell */}
        <div style={{ maxWidth: 980, margin: '0 auto' }}>

          {!isOpen ? (
            <>
              <FolderTab label="Personnel Files" color={T.accent} />
              <FolderClosedCover
                onClick={() => setIsOpen(true)}
                docType="ibuscribe · Staff Registry · Founding Team"
                coverTitle="Two people. One mission."
                fileCount="2 personnel files inside — Founder · Co-Founder · Bengaluru · Est. 2025"
                color="#111827"
                headerContent={teamHeader}
              />
            </>
          ) : (
            <div className="folder-open">
              {/* Single tab + close */}
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingLeft: 28, gap: 8 }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', padding: '8px 18px', borderRadius: '7px 7px 0 0', border: '1px solid rgba(0,0,0,0.09)', borderBottom: '1px solid #FDFCF8', background: '#FDFCF8', color: T.accent, marginBottom: '-1px', position: 'relative', zIndex: 2 }}>
                  Personnel Files
                </div>
                <button onClick={() => setIsOpen(false)} style={{ marginBottom: 4, fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#E8E4DA', color: T.textMuted, cursor: 'pointer' }}>✕ Close</button>
              </div>

          {/* Open folder */}
          <div style={{
            background: '#FDFCF8',
            border: '1px solid rgba(0,0,0,0.09)',
            borderRadius: '0 12px 12px 12px',
            boxShadow: '0 12px 56px -16px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>

            {teamHeader}

            {/* Two personnel files side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>

              {TEAM.map((p, idx) => (
                <>
                  {/* File card */}
                  <div key={p.staffId} style={{
                    padding: '32px 28px',
                    backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.035) 28px)`,
                    backgroundSize: '100% 28px',
                  }}>
                    {/* File header row */}
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
                      {/* Monogram — passport photo style */}
                      <div style={{
                        width: 72, height: 88, borderRadius: 6, flexShrink: 0,
                        background: `${p.clearanceColor}12`,
                        border: `1.5px solid ${p.clearanceColor}30`,
                        display: 'grid', placeItems: 'center',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: p.initials.length > 2 ? 13 : 18, fontWeight: 700, color: p.clearanceColor, letterSpacing: '-0.01em' }}>{p.initials}</span>
                        {/* Photo corner marks */}
                        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h], ci) => (
                          <div key={ci} style={{
                            position: 'absolute', [v]: 4, [h]: 4,
                            width: 8, height: 8,
                            borderTop: v === 'top' ? `1.5px solid ${p.clearanceColor}60` : 'none',
                            borderBottom: v === 'bottom' ? `1.5px solid ${p.clearanceColor}60` : 'none',
                            borderLeft: h === 'left' ? `1.5px solid ${p.clearanceColor}60` : 'none',
                            borderRight: h === 'right' ? `1.5px solid ${p.clearanceColor}60` : 'none',
                          }}/>
                        ))}
                      </div>

                      {/* Identity block */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: MONO, fontSize: 9, color: T.textDim, letterSpacing: '0.1em', marginBottom: 6 }}>{p.staffId}</div>
                        <div style={{ fontFamily: FEAT_FONT, fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1.15, marginBottom: 4 }}>{p.name}</div>
                        <div style={{
                          display: 'inline-block',
                          fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                          padding: '3px 10px', borderRadius: 4,
                          background: `${p.clearanceColor}15`,
                          color: p.clearanceColor,
                          border: `1px solid ${p.clearanceColor}30`,
                          marginBottom: 6,
                          textTransform: 'uppercase',
                        }}>{p.role}</div>
                        <div style={{ fontFamily: FEAT_FONT, fontSize: 12.5, color: T.textMuted, fontStyle: 'italic' }}>{p.qual}</div>
                      </div>
                    </div>

                    {/* Filed rows — like a form */}
                    <div style={{ marginBottom: 20 }}>
                      {p.areas.map((row, ri) => (
                        <div key={ri} style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'baseline', padding: '7px 0',
                          borderBottom: ri < p.areas.length - 1 ? '1px dashed rgba(0,0,0,0.08)' : 'none',
                        }}>
                          <span style={{ fontFamily: FEAT_FONT, fontSize: 11, color: T.textDim, fontStyle: 'italic', minWidth: 100 }}>{row.l}</span>
                          <span style={{ fontFamily: FEAT_FONT, fontSize: 12.5, color: T.textSecondary, fontWeight: 700, textAlign: 'right' }}>{row.v}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bio */}
                    <p style={{ fontFamily: FEAT_FONT, fontSize: 13.5, lineHeight: 1.8, color: T.textSecondary, fontStyle: 'italic', margin: '0 0 18px', borderTop: '1px dashed rgba(0,0,0,0.08)', paddingTop: 16 }}>
                      {p.bio}
                    </p>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                      {p.tags.map((tag, ti) => (
                        <span key={ti} style={{
                          fontFamily: MONO, fontSize: 9.5, fontWeight: 600,
                          letterSpacing: '0.06em',
                          padding: '3px 9px', borderRadius: 3,
                          background: `${p.clearanceColor}10`,
                          color: p.clearanceColor,
                          border: `1px solid ${p.clearanceColor}25`,
                        }}>{tag}</span>
                      ))}
                    </div>

                    {/* Stat + stamp row */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{
                        background: `${p.clearanceColor}08`,
                        border: `1px solid ${p.clearanceColor}20`,
                        borderRadius: 8, padding: '10px 14px',
                        flex: 1, marginRight: 16,
                      }}>
                        <div style={{ fontFamily: FEAT_FONT, fontSize: 24, fontWeight: 700, color: p.clearanceColor, lineHeight: 1, letterSpacing: '-0.02em' }}>{p.stat}</div>
                        <div style={{ fontFamily: FEAT_FONT, fontSize: 11.5, color: T.textMuted, fontStyle: 'italic', marginTop: 4, lineHeight: 1.4 }}>{p.statLabel}</div>
                      </div>
                      {/* Rubber stamp */}
                      <div style={{
                        border: `2.5px solid ${p.clearanceColor}`,
                        borderRadius: 6, padding: '7px 12px',
                        transform: 'rotate(-5deg)',
                        opacity: 0.6, flexShrink: 0,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontFamily: FEAT_FONT, fontSize: 13, fontWeight: 700, color: p.clearanceColor, letterSpacing: '0.14em' }}>CLEARED</div>
                        <div style={{ fontFamily: MONO, fontSize: 7.5, color: p.clearanceColor, letterSpacing: '0.1em', marginTop: 2 }}>{p.clearance}</div>
                      </div>
                    </div>
                  </div>

                  {/* Vertical divider between cards (only after first) */}
                  {idx === 0 && (
                    <div key="divider" style={{ background: 'rgba(0,0,0,0.07)', width: 1 }} />
                  )}
                </>
              ))}
            </div>

            {/* Folder footer */}
            <div style={{
              borderTop: '1px solid rgba(0,0,0,0.07)',
              padding: '10px 32px',
              background: '#F3F0E8',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: T.textDim }}>
                ibuscribe · Founding Team · Bengaluru · Established 2025
              </span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: T.textDim }}>2 of 2 records · CONFIDENTIAL</span>
            </div>
          </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const qs = [
    { q: 'Does it understand Hindi-English code switching?', a: 'Yes — natively. Whisper large-v3 handles mid-sentence language mixing, and the clinical NLP is tuned for how Indian doctors actually speak in consultations.' },
    { q: 'What happens if the AI makes a mistake?', a: 'Nothing saves until you approve. The note is a draft — you can edit any field, add anything missing, or discard it entirely. The AI is never the final word.' },
    { q: 'Does it work offline?', a: 'The full offline mode ships in Phase 3. The architecture is already offline-capable: the app records and queues locally, syncing when connectivity returns.' },
    { q: 'Is it ABDM compliant?', a: 'Yes. Every consultation produces a FHIR R4 bundle from day one. ABHA linking and HIE push are supported in the Professional tier.' },
    { q: 'How much does it cost to run at 500 consultations/day?', a: "Our infra target is under ₹10,000/month at that scale — that's why we use Groq for fast, affordable inference instead of self-hosting GPUs." },
    { q: 'Can I export notes to my EMR?', a: "Yes — FHIR R4 export works with most modern EMRs. We're also building direct integrations with common Indian clinic HIS systems in Phase 2." },
  ]
  const [open, setOpen] = useState(-1)
  return (
    <section id="faq" style={{ padding: '120px 0', position: 'relative', zIndex: 1, borderTop: `1px solid ${T.border}` }}>
      <Container style={{ maxWidth: 860 }}>
        <div className="rv" style={{ textAlign: 'center', marginBottom: 52 }}>
          <SectionLabel>FAQ</SectionLabel>
          <SectionHeading>Questions doctors actually ask us.</SectionHeading>
        </div>
        <div className="rv" style={{ display: 'grid', gap: 10 }}>
          {qs.map((it, i) => {
            const isOpen = open === i
            return (
              <div key={i} style={{
                background: isOpen ? `linear-gradient(155deg, ${T.cardMid}, ${T.card})` : `linear-gradient(155deg, ${T.card}, ${T.surface})`,
                border: `1px solid ${isOpen ? T.borderAccent : T.border}`,
                borderRadius: 16, overflow: 'hidden',
                transition: 'border-color .3s, background .3s',
                boxShadow: isOpen ? `0 16px 40px -24px ${T.accentGlow}` : 'none',
              }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: '100%', textAlign: 'left', padding: '20px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, fontWeight: 500, color: T.text }}>
                  <span>{it.q}</span>
                  <span style={{ color: T.accent, fontSize: 24, transition: 'transform .22s', transform: isOpen ? 'rotate(45deg)' : 'none', flexShrink: 0, marginLeft: 16 }}>+</span>
                </button>
                {isOpen && <div style={{ padding: '0 26px 22px', color: T.textMuted, lineHeight: 1.68, fontSize: 15 }}>{it.a}</div>}
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ onNew, onOpenPricing }) {
  return (
    <section style={{ padding: '140px 0 130px', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(70% 70% at 50% 40%, rgba(5,150,105,0.06), transparent 75%)` }} />
      <div aria-hidden className="grid-bg" style={{ position: 'absolute', inset: 0 }} />
      <Container style={{ position: 'relative', textAlign: 'center', maxWidth: 800 }}>
        <div className="rv" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: T.accentDim, border: `1px solid ${T.borderAccent}`, marginBottom: 28, fontSize: 13, color: T.accent }}>
          <span style={{ animation: 'pulseDot 2s infinite', display: 'inline-block', width: 6, height: 6, borderRadius: 99, background: T.accent }} />
          Now accepting design partners
        </div>
        <h2 className="rv" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', letterSpacing: '-0.038em', lineHeight: 1.04, fontWeight: 700, margin: 0 }}>
          Give yourself back your <span className="grad">evenings.</span>
        </h2>
        <p className="rv" style={{ color: T.textMuted, fontSize: 18.5, lineHeight: 1.65, marginTop: 20, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          30 days free. 50 consultations. No credit card. Cancel whenever. Built by two people in Bengaluru who actually care.
        </p>
        <div className="rv" style={{ display: 'inline-flex', gap: 12, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Btn variant="primary" size="lg" onClick={onNew} icon={<span>→</span>}>Start your free trial</Btn>
          <Btn variant="ghost" size="lg" onClick={onOpenPricing}>See pricing</Btn>
        </div>
      </Container>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { h: 'Product',   l: ['Features', 'Pricing', 'Use cases', 'Integrations'] },
    { h: 'Resources', l: ['Documentation', 'Clinical research', 'ABDM guide', 'Changelog'] },
    { h: 'Company',   l: ['About', 'Blog', 'Contact', 'Careers'] },
    { h: 'Legal',     l: ['Privacy', 'Terms', 'DPDP compliance', 'Security'] },
  ]
  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, background: T.surface, padding: '64px 0 32px', position: 'relative', zIndex: 1 }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr repeat(4, 1fr)', gap: 32 }}>
          <div>
            <div style={{ marginBottom: 14 }}><Brand /></div>
            <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.65, margin: 0, maxWidth: 260 }}>
              Ambient AI clinical scribe, built in Bengaluru for Indian primary care.
            </p>
          </div>
          {cols.map((c, i) => (
            <div key={i}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18, letterSpacing: '0.01em' }}>{c.h}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {c.l.map((l, j) => (
                  <li key={j}><a href="#" style={{ color: T.textMuted, fontSize: 14, transition: 'color .15s' }} onMouseEnter={e => { e.target.style.color = T.accent }} onMouseLeave={e => { e.target.style.color = T.textMuted }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ color: T.textDim, fontSize: 13 }}>© 2026 IBUSCRIBE. Built in Bengaluru.</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: T.accent, animation: 'pulseDot 2.5s infinite' }} />
            <span style={{ color: T.textDim, fontSize: 13 }}>All systems operational</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomeScreen({ onNew }) {
  useReveal()
  const [pricingOpen, setPricingOpen] = useState(false)
  const openPricing = () => setPricingOpen(true)
  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: FONT, minHeight: '100vh' }}>
      <GlobalStyles />
      <AnimatedBg />
      <Nav onNew={onNew} onOpenPricing={openPricing} />
      <Hero onNew={onNew} />
      <Problem />
      <HowItWorks />
      <UseCases />
      <Features />
      <Rural />
      <Team />
      <FAQ />
      <FinalCTA onNew={onNew} onOpenPricing={openPricing} />
      <Footer />
      <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} onNew={onNew} />
    </div>
  )
}
