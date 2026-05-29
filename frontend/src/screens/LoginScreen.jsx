import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const theme = {
  bg: '#F2F5F3',
  surface: '#FFFFFF',
  border: '#D9E3DD',
  accent: '#0C7A52',
  accent2: '#0A6142',
  accentDim: 'rgba(12,122,82,0.08)',
  text: '#0F1C16',
  textMuted: '#3E6050',
  textDim: '#7A9E8E',
  danger: '#DC2626',
  font: "'Plus Jakarta Sans', 'DM Sans', 'Segoe UI', -apple-system, sans-serif",
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── ECG Logo (same as navbar) ──────────────────────────────────────────────
function Logo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#091C14" />
      <rect width="32" height="32" rx="9" stroke="#0C7A52" strokeWidth="1" strokeOpacity="0.38" fill="none" />
      <path d="M 3,16 L 8,16 L 10,10 L 12.5,22 L 15,10 L 17.5,16 L 29,16"
        stroke="#0C7A52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPw, setShowPw]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Login failed. Please check your credentials.')
        return
      }
      // Save to localStorage
      localStorage.setItem('ibus_token',    data.access_token)
      localStorage.setItem('ibus_doctor',   JSON.stringify({
        id:        data.doctor_id,
        org_id:    data.org_id,
        full_name: data.full_name,
        role:      data.role,
      }))
      onLogin(data)
    } catch {
      setError('Cannot reach server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg, fontFamily: theme.font,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(12,122,82,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(12,122,82,0.04) 0%, transparent 50%)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{ display: 'inline-block', marginBottom: 16 }}
          >
            <Logo size={56} />
          </motion.div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: theme.text, margin: '0 0 6px' }}>
            ibuscribe
          </h1>
          <p style={{ fontSize: 14, color: theme.textMuted, margin: 0 }}>
            AI Clinical Scribe — Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="doctor@clinic.com"
                autoComplete="email"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 15,
                  border: `1.5px solid ${theme.border}`, borderRadius: 12,
                  background: '#FAFCFB', color: theme.text, fontFamily: theme.font,
                  transition: 'all 0.2s', outline: 'none',
                  opacity: loading ? 0.6 : 1,
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '12px 44px 12px 14px', fontSize: 15,
                    border: `1.5px solid ${theme.border}`, borderRadius: 12,
                    background: '#FAFCFB', color: theme.text, fontFamily: theme.font,
                    transition: 'all 0.2s', outline: 'none',
                    opacity: loading ? 0.6 : 1,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: theme.textDim, fontSize: 18, padding: 4, lineHeight: 1,
                  }}
                  tabIndex={-1}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
                    borderRadius: 10, padding: '10px 14px',
                    fontSize: 13, color: theme.danger, fontWeight: 500,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(12,122,82,0.5)' : 'linear-gradient(135deg, #0C7A52, #0A6142)',
                color: '#fff', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: theme.font,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(12,122,82,0.28)',
                transition: 'all 0.2s', marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: theme.textDim }}>
          ibuscribe Services Pvt. Ltd. · Bengaluru
        </p>
      </motion.div>
    </div>
  )
}
