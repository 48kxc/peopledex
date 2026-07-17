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
      <div className="sticky top-0 z-10 pb-3 space-y-2.5" style={{ background: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text" placeholder="Search..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl pl-10 pr-9 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"><X className="w-4 h-4 text-zinc-500" /></button>}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilter(null)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              !filter ? 'text-white' : 'text-zinc-400'
            }`}
            style={!filter ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            All ({people.length})
          </button>
          {RARITIES.map(r => {
            const c = people.filter(p => p.rarity === r).length
            if (c === 0) return null
            return (
              <button key={r} onClick={() => setFilter(filter === r ? null : r)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  filter === r ? 'text-white' : 'text-zinc-400'
                }`}
                style={filter === r ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                {R_LABELS[r]} ({c})
              </button>
            )
          })}
          <div className="w-px h-6 mx-1 self-center" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg text-zinc-400 border-0 appearance-none cursor-pointer font-medium"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
      </div>

      <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2" layout>
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