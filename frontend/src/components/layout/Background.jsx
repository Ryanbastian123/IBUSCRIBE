import React from 'react'

export default function Background() {
  return (
    <div className="mesh-overlay">
      <div style={{
         position: 'absolute',
         top: '10%',
         left: '50%',
         width: '600px',
         height: '600px',
         background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
         borderRadius: '50%',
         transform: 'translate(-50%, -50%)',
         filter: 'blur(80px)',
      }} />
    </div>
  )
}
