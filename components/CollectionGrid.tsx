'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { Search, X } from 'lucide-react'
import PersonCard from './PersonCard'
import PersonDetail from './PersonDetail'
import type { PersonEntry } from '@/lib/types'

const RARITIES = ['common','uncommon','rare','epic','legendary','mythic','ultrarare','secret']
const R_LABELS: Record<string,string> = { common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',legendary:'Legendary',mythic:'Mythic',ultrarare:'Ultra Rare',secret:'Secret' }

export default function CollectionGrid() {
  const { people } = usePeopleDex()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string | null>(null)
  const [sort, setSort] = useState<'newest'|'oldest'|'rarity'>('newest')
  const [selected, setSelected] = useState<PersonEntry | null>(null)

  const filtered = people.filter(p => {
    if (search && !p.nickname.toLowerCase().includes(search.toLowerCase())) return false
    if (filter && p.rarity !== filter) return false
    return true
  }).sort((a,b) => {
    if (sort === 'newest') return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    if (sort === 'oldest') return new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    return RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity)
  })

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <span className="text-2xl">📸</span>
        </div>
        <h2 className="text-base font-semibold text-zinc-200 mb-1">No collectibles yet</h2>
        <p className="text-sm text-zinc-500 text-center max-w-xs">Head to the Camera to start building your collection.</p>
      </div>
    )
  }

  return (
    <>
      <div className="sticky top-0 z-10 mb-5 space-y-3 pb-4" style={{ background: 'rgba(17,19,16,.88)', backdropFilter: 'blur(16px)' }}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#92988a]" />
          <input
            type="text" placeholder="Search the archive..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#1a1d18] py-3.5 pl-11 pr-9 text-sm text-[#f4f1e8] placeholder:text-[#6f7569] outline-none transition-all focus:border-[#d8f36a]/50"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"><X className="w-4 h-4 text-zinc-500" /></button>}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilter(null)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              !filter ? 'bg-[#d8f36a] text-[#111310]' : 'border border-white/10 bg-white/[.03] text-[#92988a] hover:text-[#f4f1e8]'
            }`}
          >
            All ({people.length})
          </button>
          {RARITIES.map(r => {
            const c = people.filter(p => p.rarity === r).length
            if (c === 0) return null
            return (
              <button key={r} onClick={() => setFilter(filter === r ? null : r)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === r ? 'bg-[#d8f36a] text-[#111310]' : 'border border-white/10 bg-white/[.03] text-[#92988a] hover:text-[#f4f1e8]'
                }`}
              >
                {R_LABELS[r]} ({c})
              </button>
            )
          })}
          <div className="mx-1 h-6 w-px self-center bg-white/10" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            className="shrink-0 appearance-none rounded-full border border-white/10 bg-white/[.03] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#92988a] cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
      </div>

      <motion.div className="grid grid-cols-2 gap-4 pb-2 sm:grid-cols-3 lg:grid-cols-4" layout>
        <AnimatePresence mode="popLayout">
          {filtered.map(p => (
            <motion.div key={p.id} layout exit={{ opacity: 0, scale: 0.9 }}>
              <PersonCard person={p} onClick={() => setSelected(p)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && people.length > 0 && (
        <p className="text-center py-10 text-sm text-zinc-500">No matches.</p>
      )}

      <AnimatePresence>
        {selected && <PersonDetail person={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  )
}
