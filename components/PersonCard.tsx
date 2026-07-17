'use client'

import { motion } from 'framer-motion'
import type { PersonEntry } from '@/lib/types'
import { usePeopleDex } from '@/lib/peopledex-context'
import { ArrowUpRight, Star } from 'lucide-react'

const RARITY_COLORS: Record<string, { label: string; color: string; glow: string }> = {
  common: { label: 'Common', color: '#aeb5a4', glow: 'rgba(174,181,164,.22)' }, uncommon: { label: 'Uncommon', color: '#d8f36a', glow: 'rgba(216,243,106,.28)' }, rare: { label: 'Rare', color: '#8fc7ff', glow: 'rgba(143,199,255,.32)' }, epic: { label: 'Epic', color: '#dca5ff', glow: 'rgba(220,165,255,.3)' }, legendary: { label: 'Legendary', color: '#f19a62', glow: 'rgba(241,154,98,.35)' }, mythic: { label: 'Mythic', color: '#ff8bbd', glow: 'rgba(255,139,189,.35)' }, ultrarare: { label: 'Ultra Rare', color: '#79e2d4', glow: 'rgba(121,226,212,.35)' }, secret: { label: 'Secret', color: '#ffe08a', glow: 'rgba(255,224,138,.4)' },
}

export default function PersonCard({ person, onClick }: { person: PersonEntry; onClick?: () => void }) {
  const { toggleFavorite } = usePeopleDex()
  const r = RARITY_COLORS[person.rarity] || RARITY_COLORS.common
  return <motion.button onClick={onClick} className="group relative w-full overflow-hidden rounded-[1.25rem] border bg-[#1a1d18] text-left" style={{ borderColor: r.glow }} whileTap={{ scale: .98 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5, boxShadow: `0 22px 45px ${r.glow}` }}>
    <div className="relative aspect-[4/5] overflow-hidden bg-[#242921]"><img src={person.thumbnailData} alt={person.nickname} className="h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:grayscale-0" /><div className="absolute inset-0 bg-gradient-to-t from-[#111310] via-transparent to-[#111310]/25" /><div className="absolute left-3 top-3 flex items-center gap-2"><span className="mono rounded-full border border-white/15 bg-[#111310]/70 px-2 py-1 text-[9px] uppercase tracking-wider text-[#d8f36a]">{r.label}</span></div><button onClick={e => { e.stopPropagation(); toggleFavorite(person.id) }} aria-label="Toggle favorite" className="absolute right-3 top-3 rounded-full border border-white/15 bg-[#111310]/70 p-2 opacity-0 backdrop-blur group-hover:opacity-100"><Star className={`h-3.5 w-3.5 ${person.favorite ? 'fill-[#f19a62] text-[#f19a62]' : 'text-[#f4f1e8]'}`} /></button><div className="absolute inset-x-3 bottom-3"><div className="mono text-[9px] tracking-[.16em] text-[#92988a]">ID / {person.id.slice(-6)}</div><div className="mt-1 flex items-end justify-between gap-2"><p className="truncate text-lg font-bold tracking-[-.05em] text-[#f4f1e8]">{person.nickname}</p><ArrowUpRight className="h-4 w-4 shrink-0 text-[#d8f36a] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div></div></div>
    <div className="flex items-center justify-between px-3 py-2.5"><span className="mono text-[9px] uppercase tracking-wider text-[#92988a]">{person.encounterCount} encounter{person.encounterCount === 1 ? '' : 's'}</span><span className="mono text-[9px] text-[#f19a62]">+{person.xp} XP</span></div>
  </motion.button>
}
