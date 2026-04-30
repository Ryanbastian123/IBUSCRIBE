import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Design Tokens — deep night × vivid mint ───────────────────────────────
const T = {
  bg:           '#071410',
  surface:      '#081310',
  card:         '#0D1F18',
  cardMid:      '#112619',
  cardHover:    '#162E20',
  border:       'rgba(255,255,255,0.07)',
  borderMid:    'rgba(255,255,255,0.13)',
  borderAccent: 'rgba(16,240,156,0.30)',
  accent:       '#10F09C',
  accentSoft:   '#7EFFD8',
  accentDeep:   '#0EBF7A',
  accentDim:    'rgba(16,240,156,0.08)',
  accentGlow:   'rgba(16,240,156,0.28)',
  accentInk:    '#011810',
  warning:      '#FBBF24',
  danger:       '#F87171',
  text:         '#EDFAF4',
  textSecondary:'#B8D9C8',
  textMuted:    '#6E9E88',
  textDim:      '#3D5C4A',
  blue:         '#60A5FA',
  purple:       '#A78BFA',
}

const FONT  = "'Plus Jakarta Sans', 'DM Sans', 'Segoe UI', -apple-system, sans-serif"
const MONO  = "'DM Mono', 'JetBrains Mono', ui-monospace, monospace"
const GRAD_T = `linear-gradient(130deg, #0EBF7A 0%, #10F09C 50%, #7EFFD8 100%)`

// ─── Global styles & keyframes ────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

      *, *::before, *::after { box-sizing: border-box; }
      html, body, #root {
        margin:0; padding:0;
        background:#071410; color:${T.text};
        font-family:${FONT}; -webkit-font-smoothing:antialiased; scroll-behavior:smooth;
      }
      ::selection { background:rgba(16,240,156,0.2); color:${T.accent}; }
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
          linear-gradient(rgba(16,240,156,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,240,156,0.035) 1px, transparent 1px);
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
      @keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(16,240,156,.1)} 50%{box-shadow:0 0 60px rgba(16,240,156,.3)} }
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
        background:linear-gradient(90deg,${T.accent},${T.accentSoft},${T.accent});
        background-size:200% auto;
        -webkit-background-clip:text; background-clip:text; color:transparent;
        animation:shimmer 3s linear infinite;
      }

      /* Focus + scrollbar */
      button:focus-visible,a:focus-visible { outline:2px solid ${T.accent}; outline-offset:3px; border-radius:6px; }
      ::-webkit-scrollbar { width:6px; height:6px; }
      ::-webkit-scrollbar-track { background:${T.bg}; }
      ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:6px; }
      ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.22); }
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
function AnimatedBg() {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 45% at 50% -5%, rgba(16,240,156,0.09) 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', width: 900, height: 900, top: '-22%', left: '-18%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,240,156,0.08) 0%, transparent 65%)', filter: 'blur(70px)', animation: 'orb1 26s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 700, height: 700, top: '28%', right: '-14%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 65%)', filter: 'blur(60px)', animation: 'orb2 32s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 600, height: 600, bottom: '-12%', left: '28%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,240,156,0.055) 0%, transparent 65%)', filter: 'blur(50px)', animation: 'orb3 22s ease-in-out infinite' }} />
      <div className="grid-bg" style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 130% 130% at 50% 50%, transparent 40%, ${T.bg} 100%)`, opacity: 0.55 }} />
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
  <h2 style={{ fontSize: 'clamp(30px, 4.2vw, 52px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: 0, fontWeight: 700, ...style }}>{children}</h2>
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
            color: open ? '#011810' : T.textMuted,
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
      {/* Logomark: ECG heartbeat pulse — medical listening + scribing */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="32" height="32" rx="9" fill="#091C14"/>
        <rect width="32" height="32" rx="9" stroke={T.accent} strokeWidth="1" strokeOpacity="0.38" fill="none"/>
        <path
          d="M 3,16 L 8,16 L 10,10 L 12.5,22 L 15,10 L 17.5,16 L 29,16"
          stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
      {/* Wordmark: quiet prefix + bold function word */}
      <span style={{ lineHeight: 1, userSelect: 'none', letterSpacing: 0 }}>
        <span style={{ fontSize: 15.5, fontWeight: 300, color: T.textMuted, letterSpacing: '0.07em', fontFamily: FONT }}>ibu</span><span style={{ fontSize: 15.5, fontWeight: 800, color: T.accent, letterSpacing: '-0.02em', fontFamily: FONT }}>scribe</span>
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
      onMouseEnter={e => { e.target.style.color = '#ffffff' }}
      onMouseLeave={e => { e.target.style.color = T.textSecondary }}>
      {label}
    </a>
  )
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(10,26,19,0.85)' : 'transparent',
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
            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff' }}
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
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 3), 3600)
    return () => clearInterval(id)
  }, [])
  const floatStyle = tilt
    ? { transition: 'transform 0.18s ease', transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }
    : { animation: 'float3d 7s ease-in-out infinite' }

  const card = {
    position: 'absolute', inset: 0,
    background: `linear-gradient(160deg, ${T.card} 0%, ${T.cardMid} 100%)`,
    border: `1px solid ${T.border}`,
    borderRadius: 22, padding: 28,
    boxShadow: `0 40px 100px -40px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,240,156,0.05), inset 0 1px 0 rgba(255,255,255,0.06)`,
    transition: 'opacity .75s ease, transform .75s ease',
  }
  return (
    <div style={{ position: 'relative', height: 440, width: '100%', ...floatStyle }}>
      <div style={{ position: 'absolute', inset: -40, background: `radial-gradient(60% 60% at 50% 50%, ${T.accentDim}, transparent 70%)`, filter: 'blur(20px)', animation: 'glow 4s ease-in-out infinite' }} />

      <div style={{ ...card, opacity: step === 0 ? 1 : 0, transform: step === 0 ? 'scale(1)' : 'scale(.96) translateY(8px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <Badge tone="accent">
            <span style={{ width: 8, height: 8, borderRadius: 99, background: T.danger, animation: 'pulseDot 1.4s infinite', display: 'inline-block' }} />
            RECORDING
          </Badge>
          <span style={{ fontFamily: MONO, color: T.textMuted, fontSize: 13 }}>00:42</span>
        </div>
        <div style={{ color: T.textDim, fontSize: 11, marginBottom: 10, fontFamily: MONO, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Live transcript</div>
        <p style={{ color: T.text, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          "Patient came in with complaint of <span style={{ color: T.accent }}>fever since 3 days</span>, body ache as well… temperature <span style={{ color: T.accent }}>101.2°F</span>…"
        </p>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 56, marginTop: 28 }}>
          {Array.from({ length: 44 }).map((_, i) => (
            <div key={i} style={{ flex: 1, background: T.accent, borderRadius: 2, height: '100%', transformOrigin: 'bottom', animation: `waveBar ${0.55 + (i % 6) * 0.11}s ease-in-out ${i * 0.036}s infinite`, opacity: 0.75 }} />
          ))}
        </div>
      </div>

      <div style={{ ...card, opacity: step === 1 ? 1 : 0, transform: step === 1 ? 'scale(1)' : 'scale(.96) translateY(8px)' }}>
        <Badge tone="blue">Transcribing · Whisper large-v3</Badge>
        <div style={{ marginTop: 24, display: 'grid', gap: 14 }}>
          {[
            { t: '0:00', txt: 'Doctor, I have had fever for 3 days now' },
            { t: '0:08', txt: 'Headache and body pain as well' },
            { t: '0:22', txt: 'Temp checked: 101.2 F. No cough.' },
            { t: '0:42', txt: 'Tab Dolo 650 mg TDS for 5 days' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: MONO, color: T.textDim, fontSize: 12, minWidth: 36, paddingTop: 2 }}>{l.t}</span>
              <span style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.5 }}>{l.txt}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, opacity: step === 2 ? 1 : 0, transform: step === 2 ? 'scale(1)' : 'scale(.96) translateY(8px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Badge tone="accent">✓ Clinical note ready</Badge>
          <span style={{ fontFamily: MONO, color: T.textMuted, fontSize: 12 }}>FHIR R4</span>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <Row label="Chief complaint" value="Fever × 3 days, body ache" />
          <Row label="Vitals" value="T 101.2 °F · no respiratory distress" accent />
          <Row label="Assessment" value="Viral fever · R50.9" />
          <Row label="Plan" value="Tab Dolo 650 mg TDS × 5d · rest · review 48h" accent />
        </div>
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
          <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', lineHeight: 1.04, letterSpacing: '-0.038em', margin: '0 0 22px', fontWeight: 700 }}>
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

// ─── How It Works (click-to-expand) ───────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', icon: '🎙️', t: 'Talk naturally', d: 'Hit record and consult the way you always have. Hindi, English, Tamil, Kannada — or switch mid-sentence. IBUSCRIBE follows every word, every pharmacology term, every Indian drug name.' },
    { n: '02', icon: '✦', t: 'AI writes the note', d: 'In the time it takes to say goodbye to the patient, the full clinical note is drafted — chief complaint, HPI, vitals, assessment, plan. Structured, coded, and ready.' },
    { n: '03', icon: '✓', t: 'Review & approve', d: 'Scan it, edit anything that needs a tweak, then approve with one click. Nothing is ever saved or pushed without your explicit sign-off. Doctor always stays in control.' },
  ]
  return (
    <section id="how" style={{ padding: '120px 0', position: 'relative', zIndex: 1 }}>
      <Container>
        <div className="rv" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
          <SectionLabel>How it works</SectionLabel>
          <SectionHeading>Three steps. About two minutes.</SectionHeading>
          <SectionSub>Click any step to see how it works under the hood.</SectionSub>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {steps.map((s, i) => (
            <ExpandCard key={i} num={s.n} icon={s.icon} title={s.t} delay={i * 100}>
              <p style={{ color: T.textSecondary, lineHeight: 1.7, margin: 0, fontSize: 14.5 }}>{s.d}</p>
            </ExpandCard>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ─── Use Cases ────────────────────────────────────────────────────────────────
const USE_CASES = {
  diabetes: { label: 'Diabetes',    snippet: '"Fasting sugar is 186, post-meal 248. HbA1c has been 8.4 for the past 3 months. Complaints of polyuria and nocturia. Fatigue as well."', cc: 'Polyuria, nocturia, fatigue × 3 months',  dx: 'Type 2 Diabetes Mellitus — uncontrolled', icd: 'E11.9',  plan: 'Metformin SR 500 mg BD · Glimepiride 1 mg OD · HbA1c recheck 3 mo · diet counselling' },
  gastro:   { label: 'Gastro',      snippet: '"Epigastric pain, burning sensation, gets worse after eating. Acidity is there since 2 weeks. No vomiting."',                      cc: 'Epigastric burning × 2 weeks, post-prandial', dx: 'Gastritis / functional dyspepsia',       icd: 'K29.70', plan: 'Pan-D 40 mg OD × 14d · avoid NSAIDs · lifestyle advice' },
  htn:      { label: 'Hypertension', snippet: '"BP 158 by 96 today. Headache in the mornings. Family history of hypertension. No chest pain."',                                cc: 'Morning headaches, elevated BP (158/96)',   dx: 'Essential Hypertension — Stage 1',      icd: 'I10',    plan: 'Amlodipine 5 mg OD · home BP log × 2w · low salt diet' },
  peds:     { label: 'Pediatric',   snippet: '"Child has had fever for 2 days, loose motions as well — 4–5 times. Weight 12 kg. No vomiting, feeds are okay."',               cc: 'Fever × 2 days + loose stools × 2 days',  dx: 'Acute gastroenteritis with fever',      icd: 'A09',    plan: 'ORS sachets · Zinc 20 mg OD × 14d · Cifran suspension per weight' },
}

function UseCases() {
  const [tab, setTab] = useState('diabetes')
  const uc = USE_CASES[tab]
  return (
    <section id="cases" style={{ padding: '120px 0', position: 'relative', zIndex: 1, borderTop: `1px solid ${T.border}`, background: `linear-gradient(180deg, transparent, rgba(18,43,31,0.4), transparent)` }}>
      <Container>
        <div className="rv" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
          <SectionLabel>Clinical use cases</SectionLabel>
          <SectionHeading>Trained on the visits you actually see.</SectionHeading>
          <SectionSub>Indian drug names, Indian disease prevalence, Hindi-English code-switching. Not an American model with a translator bolted on.</SectionSub>
        </div>
        <div className="rv" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          {Object.entries(USE_CASES).map(([k, v]) => {
            const active = tab === k
            return (
              <button key={k} onClick={() => setTab(k)} style={{
                padding: '9px 20px', borderRadius: 999,
                background: active ? T.accent : T.card,
                color: active ? T.accentInk : T.textMuted,
                border: `1px solid ${active ? T.accent : T.border}`,
                fontWeight: active ? 600 : 500, fontSize: 14,
                transition: 'all .22s cubic-bezier(.16,1,.3,1)',
                boxShadow: active ? `0 8px 24px -10px ${T.accentGlow}` : 'none',
              }}>{v.label}</button>
            )
          })}
        </div>
        <div className="rv" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ background: `linear-gradient(155deg, ${T.card}, ${T.surface})`, border: `1px solid ${T.border}`, borderRadius: 20, padding: 30 }}>
            <div style={{ fontFamily: MONO, color: T.textDim, fontSize: 11, letterSpacing: '0.18em', marginBottom: 14, textTransform: 'uppercase' }}>What the doctor heard</div>
            <p style={{ color: T.textSecondary, fontSize: 15.5, lineHeight: 1.75, margin: 0 }}>{uc.snippet}</p>
            <div style={{ marginTop: 28, padding: 16, border: `1px dashed rgba(255,255,255,0.1)`, borderRadius: 12, color: T.textDim, fontFamily: MONO, fontSize: 12.5, lineHeight: 1.7 }}>
              {'// Traditional scribble:\n// "fev 3d, dolo ×5d, rev 48h"\n// Illegible · no codes · no structure'}
            </div>
          </div>
          <div style={{ background: `linear-gradient(155deg, ${T.cardMid}, ${T.card})`, border: `1px solid ${T.borderAccent}`, borderRadius: 20, padding: 30, boxShadow: `0 20px 60px -30px ${T.accentGlow}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Badge>IBUSCRIBE output</Badge>
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

// ─── Features (click-to-expand) ───────────────────────────────────────────────
function Features() {
  const feats = [
    { i: '🇮🇳', t: 'Built for India',            d: 'Dolo, Pan-D, Augmentin, Metformin SR. Indian drug names, local disease prevalence, pharmacology you actually prescribe — not an American model with a translator bolted on.' },
    { i: '🧑‍⚕️', t: 'Doctor stays in control',    d: 'Nothing is saved, signed or pushed until you approve it. The AI drafts — you decide, every single time. This is a hard architectural invariant, not a toggle.' },
    { i: '🔗', t: 'ABDM-native',                  d: 'FHIR R4 bundles generated from day one. Push to Health Information Exchange, ABHA linking, consent-first architecture. Regional data residency built in.' },
    { i: '🎧', t: 'Real-time transcription',      d: 'Whisper large-v3 on fast inference. You finish the visit, the transcript is already done. Handles accents, code-switching, and noisy OPD environments.' },
    { i: '💊', t: 'Medication intelligence',      d: 'Recognises BD, TDS, QID, OD dosing. Duration (×5d, ×14d). With-food, before-food, after-food instructions. In any of 8 Indian languages you speak them.' },
    { i: '📐', t: 'Structured from speech',       d: 'Chief complaint, HPI, vitals, assessment, plan — all separated, all editable, all ready for EMR export. No reformatting. No rewriting.' },
  ]
  return (
    <section style={{ padding: '120px 0', position: 'relative', zIndex: 1 }}>
      <Container>
        <div className="rv" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
          <SectionLabel>Features</SectionLabel>
          <SectionHeading>Everything a primary care doctor in India actually needs.</SectionHeading>
          <SectionSub>Click any feature to dig deeper.</SectionSub>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {feats.map((f, i) => (
            <ExpandCard key={i} icon={f.i} title={f.t} delay={i * 60}>
              <p style={{ color: T.textSecondary, margin: 0, lineHeight: 1.7, fontSize: 14.5 }}>{f.d}</p>
            </ExpandCard>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ─── Rural ────────────────────────────────────────────────────────────────────
function Rural() {
  const features = [
    { icon: '📡', t: 'Offline-first',           d: 'Records while disconnected, syncs automatically when back online. Built for PHCs with patchy connectivity — not just metro clinics with fibre.' },
    { icon: '🗣️', t: '8 regional languages',    d: 'Hindi, Tamil, Telugu, Kannada, Bengali, Malayalam, Marathi, English — and mid-sentence code-switching, which is how Indian doctors actually speak.' },
    { icon: '🏛️', t: 'NHM & ABDM aligned',     d: 'Ayushman Bharat compliant from day one. ABHA linking, HIE push, and NHM reporting-ready. Built for the national stack, not around it.' },
    { icon: '⚡', t: 'High-volume ready',       d: 'Designed for 50–100 patients per day. PHC and CHC workflows, not just 20-patient private practice. Batched uploads, efficient queuing.' },
    { icon: '📱', t: 'Low-cost hardware',       d: 'Runs on a ₹15,000 Android tablet or basic laptop. No GPU, no local model, no expensive server. The cloud does the heavy lifting.' },
    { icon: '🤝', t: 'Community health fit',    d: 'Works alongside ASHA workers and ANMs. One doctor, many hands — the note still gets written, and the chain of care stays intact.' },
  ]
  return (
    <section style={{ padding: '120px 0', position: 'relative', zIndex: 1, borderTop: `1px solid ${T.border}` }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 56, alignItems: 'start' }}>
          <div className="rvl">
            <SectionLabel>Rural & semi-urban India</SectionLabel>
            <SectionHeading>Built for Bharat,<br /><span className="grad">not just Bengaluru.</span></SectionHeading>
            <SectionSub>40% of India's doctors serve 70% of its population — at PHCs, CHCs, and district hospitals where the need is greatest and resources fewest.</SectionSub>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 40 }}>
              {[
                { n: '150k+', l: 'Primary health centres' },
                { n: '25k+',  l: 'Community health centres' },
                { n: '1 doc', l: 'For 30,000 patients' },
              ].map((s, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '20px 8px',
                  background: `linear-gradient(160deg, ${T.card}, ${T.surface})`,
                  border: `1px solid ${T.border}`, borderRadius: 16,
                }}>
                  <div className="grad" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{s.n}</div>
                  <div style={{ color: T.textMuted, fontSize: 11.5, marginTop: 6, lineHeight: 1.4 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <figure className="rv" style={{
              margin: '36px 0 0', padding: '22px 26px',
              background: T.accentDim,
              border: `1px solid ${T.borderAccent}`,
              borderRadius: 18,
              display: 'flex', gap: 18, alignItems: 'flex-start',
              position: 'relative', overflow: 'hidden',
            }}>
              <div aria-hidden style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: T.accentDim, filter: 'blur(40px)' }} />
              <div style={{ position: 'relative', width: 44, height: 44, borderRadius: 99, flexShrink: 0, background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`, display: 'grid', placeItems: 'center', color: T.accentInk, fontWeight: 700, fontSize: 16, boxShadow: `0 8px 20px -6px ${T.accentGlow}` }}>D</div>
              <figcaption style={{ position: 'relative' }}>
                <blockquote style={{ margin: 0, fontSize: 15.5, color: T.text, lineHeight: 1.7, fontStyle: 'italic' }}>"I see 80 patients a day. I used to stay back 2 hours writing notes. Now I'm home by 6."</blockquote>
                <div style={{ marginTop: 10, fontSize: 12.5, color: T.textMuted }}>Dr. Deepak Rao · PHC Medical Officer · Raichur, Karnataka</div>
              </figcaption>
            </figure>
          </div>
          {/* Right: ExpandCard grid */}
          <div className="rvr" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {features.map((f, i) => (
              <ExpandCard key={i} icon={f.icon} title={f.t} compact delay={i * 55}>
                <p style={{ color: T.textSecondary, margin: 0, lineHeight: 1.65, fontSize: 13.5 }}>{f.d}</p>
              </ExpandCard>
            ))}
          </div>
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

// ─── Team (click-to-expand) ───────────────────────────────────────────────────
function Team() {
  const founders = [
    { initials: 'MB',  name: 'Max Bastian',            title: 'Co-Founder & Chief Medical Officer', sub: 'MBBS · Bengaluru', bio: 'Practicing physician who lived the documentation burden first-hand — 80 patients a day, two hours of notes after. Drives clinical accuracy, Indian healthcare context, and ABDM compliance across every line of IBUSCRIBE.' },
    { initials: 'RCB', name: 'Ryan Chrisden Bastian',  title: 'Co-Founder & Head of Engineering',   sub: 'AI & Data Science Engineer · Bangalore', bio: 'Built IBUSCRIBE from the ground up — the ambient recording pipeline, clinical NLP, FHIR R4 builder, and the full-stack product. Obsessed with making AI genuinely useful where the need is greatest.' },
  ]
  return (
    <section style={{ padding: '120px 0', position: 'relative', zIndex: 1, borderTop: `1px solid ${T.border}` }}>
      <Container>
        <div className="rv" style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
          <SectionLabel>Who we are</SectionLabel>
          <SectionHeading>Two people. One mission.</SectionHeading>
          <SectionSub>A doctor and an engineer who believe the pen has outpaced the stethoscope for far too long. Click a card to meet them.</SectionSub>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }}>
          {founders.map((f, i) => (
            <ExpandCard
              key={i}
              icon={<span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', color: T.accentInk }}>{f.initials}</span>}
              title={f.name}
              delay={i * 120}
            >
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ color: T.accent, fontSize: 12, fontFamily: MONO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{f.title}</div>
                <div style={{ color: T.textMuted, fontSize: 13 }}>{f.sub}</div>
                <p style={{ color: T.textSecondary, fontSize: 14.5, lineHeight: 1.7, margin: '8px 0 0' }}>{f.bio}</p>
              </div>
            </ExpandCard>
          ))}
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
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(70% 70% at 50% 40%, rgba(16,240,156,0.08), transparent 75%)` }} />
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
                  <li key={j}><a href="#" style={{ color: T.textMuted, fontSize: 14, transition: 'color .15s' }} onMouseEnter={e => { e.target.style.color = T.text }} onMouseLeave={e => { e.target.style.color = T.textMuted }}>{l}</a></li>
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
