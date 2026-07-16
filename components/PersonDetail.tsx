'use client'

import { motion } from 'framer-motion'
import type { PersonEntry } from '@/lib/types'
import { usePeopleDex } from '@/lib/peopledex-context'
import { X, Trash2, Star, Calendar, MapPin, Zap, Hash } from 'lucide-react'

const R_LABELS: Record<string, { label: string; color: string }> = {
  common:    { label: 'Common',    color: '#737373' },
  uncommon:  { label: 'Uncommon',  color: '#16a34a' },
  rare:      { label: 'Rare',      color: '#2563eb' },
  epic:      { label: 'Epic',      color: '#7c3aed' },
  legendary: { label: 'Legendary', color: '#ea580c' },
  mythic:    { label: 'Mythic',    color: '#db2777' },
  ultrarare: { label: 'Ultra Rare', color: '#0891b2' },
  secret:    { label: 'Secret',    color: '#ca8a04' },
}

interface Props { person: PersonEntry; onClose: () => void }

export default function PersonDetail({ person, onClose }: Props) {
  const { deletePerson, toggleFavorite } = usePeopleDex()
  const r = R_LABELS[person.rarity] || R_LABELS.common

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90"><X className="w-4 h-4 text-[#737373]" /></button>

        <div className="aspect-[4/3] bg-[#f5f4f1] relative">
          <img src={person.imageData} alt={person.nickname} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 text-xs font-bold" style={{ color: r.color }}>{r.label}</div>
          <button onClick={() => toggleFavorite(person.id)} className="absolute top-3 left-24 p-2 rounded-full bg-white/90">
            <Star className={`w-4 h-4 ${person.favorite ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-[#a3a3a3]'}`} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">{person.nickname}</h2>
            <p className="text-xs text-[#a3a3a3]">#{person.id.slice(-6)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#f5f4f1] rounded-xl p-3">
              <div className="flex items-center gap-1 text-[10px] text-[#737373] mb-0.5"><Calendar className="w-3 h-3" />Captured</div>
              <div className="text-sm font-medium text-[#1a1a1a]">{new Date(person.capturedAt).toLocaleDateString()}</div>
            </div>
            <div className="bg-[#f5f4f1] rounded-xl p-3">
              <div className="flex items-center gap-1 text-[10px] text-[#737373] mb-0.5"><Hash className="w-3 h-3" />Encounters</div>
              <div className="text-sm font-medium text-[#1a1a1a]">{person.encounterCount}</div>
            </div>
            <div className="bg-[#f5f4f1] rounded-xl p-3">
              <div className="flex items-center gap-1 text-[10px] text-[#737373] mb-0.5"><Zap className="w-3 h-3" />XP</div>
              <div className="text-sm font-bold" style={{ color: r.color }}>{person.xp} XP</div>
            </div>
            {person.location && (
              <div className="bg-[#f5f4f1] rounded-xl p-3">
                <div className="flex items-center gap-1 text-[10px] text-[#737373] mb-0.5"><MapPin className="w-3 h-3" />Location</div>
                <div className="text-xs text-[#1a1a1a] truncate">{person.location.latitude.toFixed(2)}, {person.location.longitude.toFixed(2)}</div>
              </div>
            )}
          </div>

          {person.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {person.tags.map(t => <span key={t} className="text-[11px] px-2 py-1 rounded-lg bg-[#f5f4f1] text-[#737373]">{t}</span>)}
            </div>
          )}

          <button onClick={() => { deletePerson(person.id); onClose() }}
            className="w-full py-2.5 rounded-xl border border-[#fecaca] text-[#dc2626] text-sm font-medium hover:bg-[#fef2f2] transition-colors flex items-center justify-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
