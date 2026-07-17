'use client'

import { motion } from 'framer-motion'
import type { PersonEntry } from '@/lib/types'
import { usePeopleDex } from '@/lib/peopledex-context'
import { Star } from 'lucide-react'

const RARITY_COLORS: Record<string, { label: string; color: string; glow: string }> = {
  common:    { label: 'Common',    color: '#A1A1AA', glow: 'rgba(161,161,170,0.15)' },
  uncommon:  { label: 'Uncommon',  color: '#10B981', glow: 'rgba(16,185,129,0.2)' },
  rare:      { label: 'Rare',      color: '#6366F1', glow: 'rgba(99,102,241,0.25)' },
  epic:      { label: 'Epic',      color: '#A855F7', glow: 'rgba(168,85,247,0.3)' },
  legendary: { label: 'Legendary', color: '#F59E0B', glow: 'rgba(245,158,11,0.35)' },
  mythic:    { label: 'Mythic',    color: '#EC4899', glow: 'rgba(236,72,153,0.4)' },
  ultrarare: { label: 'Ultra Rare', color: '#06B6D4', glow: 'rgba(6,182,212,0.45)' },
  secret:    { label: 'Secret',    color: '#FBBF24', glow: 'rgba(251,191,36,0.5)' },
}

interface Props { person: PersonEntry; onClick?: () => void }

export default function PersonCard({ person, onClick }: Props) {
  const { toggleFavorite } = usePeopleDex()
  const r = RARITY_COLORS[person.rarity] || RARITY_COLORS.common

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left glass overflow-hidden group cursor-pointer"
      style={{ borderColor: r.glow }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ boxShadow: `0 4px 24px ${r.glow}` }}
      transition={{ duration: 0.2 }}
    >
      <div className="aspect-square relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <img src={person.thumbnailData} alt={person.nickname} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        <button
          onClick={e => { e.stopPropagation(); toggleFavorite(person.id) }}
          className="absolute top-2 left-2 p-1.5 rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(8px)' }}
        >
          <Star className={`w-3 h-3 ${person.favorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
        </button>
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold"
          style={{ background: 'rgba(9,9,11,0.8)', color: r.color, backdropFilter: 'blur(8px)' }}
        >
          {r.label}
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-zinc-200 truncate">{person.nickname}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-medium" style={{ color: r.color }}>{r.label}</span>
          <span className="text-[10px] text-zinc-600">·</span>
          <span className="text-[10px] text-zinc-500">{person.xp}XP</span>
        </div>
      </div>
    </motion.button>
  )
}