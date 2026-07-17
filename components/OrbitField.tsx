'use client'

import { motion } from 'framer-motion'

const points = [
  { x: '22%', y: '30%', label: 'warm signal', tone: 'lime', delay: 0 },
  { x: '72%', y: '23%', label: 'new entry', tone: 'blue', delay: 0.8 },
  { x: '78%', y: '70%', label: 'rare sighting', tone: 'orange', delay: 1.5 },
  { x: '34%', y: '77%', label: 'nearby', tone: 'lime', delay: 2.2 },
]

export default function OrbitField({ count }: { count: number }) {
  return (
    <div className="orbit-field" aria-label={`${count} people in your collection`}>
      <div className="orbit-field__wash" />
      <div className="orbit-field__grid" />
      <motion.div className="orbit orbit--one" animate={{ rotate: 360 }} transition={{ duration: 42, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="orbit orbit--two" animate={{ rotate: -360 }} transition={{ duration: 31, repeat: Infinity, ease: 'linear' }} />
      <div className="orbit-field__core"><span className="mono">{String(count).padStart(2, '0')}</span><small>encounters</small></div>
      {points.map(point => <motion.div key={point.label} className={`field-point field-point--${point.tone}`} style={{ left: point.x, top: point.y }} animate={{ scale: [1, 1.15, 1], opacity: [.62, 1, .62] }} transition={{ duration: 3.2, delay: point.delay, repeat: Infinity, ease: 'easeInOut' }}><span /><b>{point.label}</b></motion.div>)}
      <div className="orbit-field__readout mono"><span>LAT 42.3314</span><span>LONG -83.0458</span><span className="live-dot">● LIVE</span></div>
    </div>
  )
}
