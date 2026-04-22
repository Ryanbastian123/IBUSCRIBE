import React from 'react'
import Button from '../ui/Button'
import logoImg from '../../../logo.PNG'

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={logoImg} alt="ibuscribe" style={{ width: '28px', height: '28px' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--text-dark)' }}>
          ibuscribe
        </span>
      </div>

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
