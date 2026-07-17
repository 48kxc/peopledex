'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { Zap, Star, Sparkle } from 'lucide-react'

const R_LABELS: Record<string, { label: string; color: string; glow: string }> = {
  common:    { label: 'Common',    color: '#A1A1AA', glow: '0 0 10px rgba(161,161,170,0.3)' },
  uncommon:  { label: 'Uncommon',  color: '#10B981', glow: '0 0 20px rgba(16,185,129,0.4)' },
  rare:      { label: 'Rare',      color: '#6366F1', glow: '0 0 25px rgba(99,102,241,0.5)' },
  epic:      { label: 'Epic',      color: '#A855F7', glow: '0 0 30px rgba(168,85,247,0.5)' },
  legendary: { label: 'Legendary', color: '#F59E0B', glow: '0 0 35px rgba(245,158,11,0.6)' },
  mythic:    { label: 'Mythic',    color: '#EC4899', glow: '0 0 40px rgba(236,72,153,0.6)' },
  ultrarare: { label: 'Ultra Rare',color: '#06B6D4', glow: '0 0 45px rgba(6,182,212,0.7)' },
  secret:    { label: 'Secret',    color: '#FBBF24', glow: '0 0 50px rgba(251,191,36,0.8)' },
}

export default function XPPopup() {
  const { xpPopup, setXpPopup } = usePeopleDex()
  return (
    <AnimatePresence>
      {xpPopup && (
        <motion.div
          key={xpPopup.key}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: -10, scale: 1 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => setTimeout(() => setXpPopup(null), 1500)}
        >
          <div
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5"
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#C7D2FE',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: '#6366F1' }} />
            +{xpPopup.amount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function RarityReveal() {
  const { rarityReveal, setRarityReveal } = usePeopleDex()
  return (
    <AnimatePresence>
      {rarityReveal && (
        <motion.div
          key={rarityReveal.key}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => setTimeout(() => setRarityReveal(null), 2000)}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{
                background: `${R_LABELS[rarityReveal.rarity]?.color}15`,
                border: `1px solid ${R_LABELS[rarityReveal.rarity]?.color}30`,
                boxShadow: R_LABELS[rarityReveal.rarity]?.glow,
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Star className="w-8 h-8" style={{ color: R_LABELS[rarityReveal.rarity]?.color }} />
            </motion.div>
            <motion.div
              className="text-xl font-bold"
              style={{
                color: R_LABELS[rarityReveal.rarity]?.color,
                textShadow: R_LABELS[rarityReveal.rarity]?.glow,
              }}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {R_LABELS[rarityReveal.rarity]?.label}!
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Confetti() {
  const { rarityReveal } = usePeopleDex()
  if (!rarityReveal || rarityReveal.rarity === 'common') return null
  const colors = ['#6366F1','#A855F7','#EC4899','#F59E0B','#10B981','#06B6D4','#F97316']
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[i % colors.length],
    size: Math.random() * 5 + 3,
    delay: Math.random() * 0.5,
    dur: Math.random() * 1.2 + 0.8,
  }))
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute top-1/2 rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}80`,
          }}
          initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
          animate={{
            y: [0, -150 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 150],
            opacity: [1, 0],
            scale: [1, 0],
            rotate: [0, Math.random() * 360],
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}