'use client'

import { motion } from 'framer-motion'
import type { PersonEntry } from '@/lib/types'
import { usePeopleDex } from '@/lib/peopledex-context'
import { X, Trash2, Star, Calendar, MapPin, Zap, Hash } from 'lucide-react'

const R_LABELS: Record<string, { label: string; color: string }> = {
  common:    { label: 'Common',    color: '#A1A1AA' },
  uncommon:  { label: 'Uncommon',  color: '#10B981' },
  rare:      { label: 'Rare',      color: '#6366F1' },
  epic:      { label: 'Epic',      color: '#A855F7' },
  legendary: { label: 'Legendary', color: '#F59E0B' },
  mythic:    { label: 'Mythic',    color: '#EC4899' },
  ultrarare: { label: 'Ultra Rare', color: '#06B6D4' },
  secret:    { label: 'Secret',    color: '#FBBF24' },
}

interface Props { person: PersonEntry; onClose: () => void }

export default function PersonDetail({ person, onClose }: Props) {
  const { deletePerson, toggleFavorite } = usePeopleDex()
  const r = R_LABELS[person.rarity] || R_LABELS.common

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full cursor-pointer transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#A1A1AA' }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="aspect-[4/3] relative" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <img src={person.imageData} alt={person.nickname} className="w-full h-full object-cover" />
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(9,9,11,0.85)', color: r.color, backdropFilter: 'blur(8px)' }}
          >
            {r.label}
          </div>
          <button
            onClick={() => toggleFavorite(person.id)}
            className="absolute top-3 left-24 p-2 rounded-full cursor-pointer transition-colors"
            style={{ background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <Star className={`w-4 h-4 ${person.favorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">{person.nickname}</h2>
            <p className="text-xs text-zinc-500">#{person.id.slice(-6)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5"><Calendar className="w-3 h-3" />Captured</div>
              <div className="text-sm font-medium text-zinc-200">{new Date(person.capturedAt).toLocaleDateString()}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5"><Hash className="w-3 h-3" />Encounters</div>
              <div className="text-sm font-medium text-zinc-200">{person.encounterCount}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5"><Zap className="w-3 h-3" />XP</div>
              <div className="text-sm font-bold" style={{ color: r.color }}>{person.xp} XP</div>
            </div>
            {person.location && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-0.5"><MapPin className="w-3 h-3" />Location</div>
                <div className="text-xs text-zinc-300 truncate">{person.location.latitude.toFixed(2)}, {person.location.longitude.toFixed(2)}</div>
              </div>
            )}
          </div>

          {person.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {person.tags.map(t => (
                <span key={t} className="text-[11px] px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', color: '#A1A1AA' }}>{t}</span>
              ))}
            </div>
          )}

          <button
            onClick={() => { deletePerson(person.id); onClose() }}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}