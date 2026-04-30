import React from 'react'
import Button from '../ui/Button'

const ACCENT = '#10F09C'
const MUTED  = '#6E9E88'
const FONT   = "'Plus Jakarta Sans', 'DM Sans', 'Segoe UI', -apple-system, sans-serif"

function BrandMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect width="32" height="32" rx="9" fill="#091C14"/>
        <rect width="32" height="32" rx="9" stroke={ACCENT} strokeWidth="1" strokeOpacity="0.38" fill="none"/>
        <path d="M 3,16 L 8,16 L 10,10 L 12.5,22 L 15,10 L 17.5,16 L 29,16" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ lineHeight: 1, userSelect: 'none' }}>
        <span style={{ fontSize: 15.5, fontWeight: 300, color: MUTED, letterSpacing: '0.07em', fontFamily: FONT }}>ibu</span><span style={{ fontSize: 15.5, fontWeight: 800, color: ACCENT, letterSpacing: '-0.02em', fontFamily: FONT }}>scribe</span>
      </span>
    </div>
  )
}

export default function Navbar({ onNew }) {
  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 100
    }}>
      <BrandMark />

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <a href="#features" style={{ color: 'var(--text-muted-dark)', textDecoration: 'none', fontSize: '14px' }}>Features</a>
        <a href="#pricing" style={{ color: 'var(--text-muted-dark)', textDecoration: 'none', fontSize: '14px' }}>Pricing</a>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="secondary">Sign In</Button>
        <Button variant="primary" onClick={onNew}>Get Started</Button>
      </div>
    </nav>
  )
}
