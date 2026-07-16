'use client'

import { motion } from 'framer-motion'
import type { PersonEntry } from '@/lib/types'
import { usePeopleDex } from '@/lib/peopledex-context'
import { Star } from 'lucide-react'

const RARITY_LABELS: Record<string, { label: string; color: string }> = {
  common:    { label: 'Common',    color: '#737373' },
  uncommon:  { label: 'Uncommon',  color: '#16a34a' },
  rare:      { label: 'Rare',      color: '#2563eb' },
  epic:      { label: 'Epic',      color: '#7c3aed' },
  legendary: { label: 'Legendary', color: '#ea580c' },
  mythic:    { label: 'Mythic',    color: '#db2777' },
  ultrarare: { label: 'Ultra Rare', color: '#0891b2' },
  secret:    { label: 'Secret',    color: '#ca8a04' },
}

interface Props { person: PersonEntry; onClick?: () => void }

export default function PersonCard({ person, onClick }: Props) {
  const { toggleFavorite } = usePeopleDex()
  const r = RARITY_LABELS[person.rarity] || RARITY_LABELS.common

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left card card-hover overflow-hidden group cursor-pointer"
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="aspect-square bg-[#f5f4f1] relative overflow-hidden">
        <img src={person.thumbnailData} alt={person.nickname} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        <button
          onClick={e => { e.stopPropagation(); toggleFavorite(person.id) }}
          className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Star className={`w-3 h-3 ${person.favorite ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#737373]'}`} />
        </button>
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-semibold" style={{ color: r.color }}>
          {r.label}
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-[#1a1a1a] truncate">{person.nickname}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-medium" style={{ color: r.color }}>{r.label}</span>
          <span className="text-[10px] text-[#a3a3a3]">·</span>
          <span className="text-[10px] text-[#a3a3a3]">{person.xp}XP</span>
        </div>
      </div>
    </motion.button>
  )
}
