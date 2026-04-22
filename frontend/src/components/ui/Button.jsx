import { motion } from 'motion/react'

export default function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const baseStyled = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    fontFamily: 'var(--font-sans)'
  }

  const variants = {
    primary: {
      background: '#FFFFFF',
      color: '#000000',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 2px 8px rgba(255,255,255,0.15)'
    },
    secondary: {
      background: 'rgba(255,255,255,0.05)',
      color: '#FFFFFF',
      border: '1px solid var(--border-dark)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted-dark)'
    }
  }

  return (
    <motion.button 
      whileHover={{ y: -1, opacity: 0.9 }}
      whileTap={{ scale: 0.98 }}
      style={{ ...baseStyled, ...variants[variant] }}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}
