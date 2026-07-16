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
        <div className="text-5xl mb-4">📸</div>
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-1">No collectibles yet</h2>
        <p className="text-sm text-[#737373] text-center max-w-xs">Head to the Camera to start building your collection.</p>
      </div>
    )
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-[#faf9f7] pb-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
          <input
            type="text" placeholder="Search..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-[#e6e4e0] rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-[#a3a3a3]" /></button>}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button onClick={() => setFilter(null)} className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${!filter ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f4f1] text-[#737373] hover:bg-[#e6e4e0]'}`}>
            All ({people.length})
          </button>
          {RARITIES.map(r => {
            const c = people.filter(p => p.rarity === r).length
            if (c === 0) return null
            return (
              <button key={r} onClick={() => setFilter(filter === r ? null : r)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === r ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f4f1] text-[#737373] hover:bg-[#e6e4e0]'}`}>
                {R_LABELS[r]} ({c})
              </button>
            )
          })}
          <div className="w-px h-6 bg-[#e6e4e0] mx-1 self-center" />
          <select value={sort} onChange={e => setSort(e.target.value as any)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-[#f5f4f1] text-[#737373] border-0 appearance-none cursor-pointer font-medium">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
      </div>

      <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-3" layout>
        <AnimatePresence mode="popLayout">
          {filtered.map(p => (
            <motion.div key={p.id} layout exit={{ opacity: 0, scale: 0.9 }}>
              <PersonCard person={p} onClick={() => setSelected(p)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && people.length > 0 && (
        <p className="text-center py-10 text-sm text-[#a3a3a3]">No matches.</p>
      )}

      <AnimatePresence>
        {selected && <PersonDetail person={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  )
}
