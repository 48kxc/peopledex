'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { levelFromXp, xpForLevel } from '@/lib/game-engine'
import { Edit3, Save, Shield } from 'lucide-react'

const R_LABELS: Record<string,{label:string;color:string}> = {
  common:{label:'Common',color:'#737373'},uncommon:{label:'Uncommon',color:'#16a34a'},rare:{label:'Rare',color:'#2563eb'},
  epic:{label:'Epic',color:'#7c3aed'},legendary:{label:'Legendary',color:'#ea580c'},mythic:{label:'Mythic',color:'#db2777'},
  ultrarare:{label:'Ultra Rare',color:'#0891b2'},secret:{label:'Secret',color:'#ca8a04'},
}

const EMOJIS = ['🔍','📸','🎯','⭐','🔥','👑','🌈','💎','🦊','🐉','👻','🤖','🎮','🚀','🌙']

export default function ProfilePage() {
  const { profile, people, achievements, setProfile } = usePeopleDex()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.username || 'Explorer')

  if (!profile) return null

  const lvl = levelFromXp(profile.xp)
  const pct = (lvl.currentXp / lvl.nextLevelXp) * 100
  const achDone = achievements.filter(a => a.completed).length
  const fav = people.find(p => p.id === profile.favoriteId)

  return (
    <div className="px-4 pt-10 pb-4 space-y-6">
      {/* Header card */}
      <div className="card p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2563eb]/[0.03] to-transparent" />

        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
          className="text-5xl inline-block cursor-pointer"
          onClick={() => {
            const i = EMOJIS.indexOf(profile.avatarEmoji)
            setProfile({ avatarEmoji: EMOJIS[(i + 1) % EMOJIS.length] })
          }}>
          {profile.avatarEmoji}
        </motion.button>
        <p className="text-[10px] text-[#d4d0cb] mt-1">tap to change</p>

        {editing ? (
          <div className="flex items-center justify-center gap-2 mt-3">
            <input value={name} onChange={e => setName(e.target.value)} maxLength={20} autoFocus
              className="bg-white border border-[#e6e4e0] rounded-lg px-3 py-1.5 text-sm text-[#1a1a1a] text-center w-44 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20" />
            <button onClick={() => { setProfile({ username: name }); setEditing(false) }}
              className="p-1.5 rounded-lg bg-[#f5f4f1] text-[#1a1a1a] hover:bg-[#e6e4e0]"><Save className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mt-3">
            <h2 className="text-xl font-bold text-[#1a1a1a]">{profile.username}</h2>
            <button onClick={() => setEditing(true)}><Edit3 className="w-3.5 h-3.5 text-[#a3a3a3] hover:text-[#737373]" /></button>
          </div>
        )}

        <p className="text-xs text-[#a3a3a3] mt-1">{profile.cosmetics.title}</p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[#737373] mb-1">
            <span>Level {profile.level}</span>
            <span>{lvl.currentXp.toLocaleString()} / {lvl.nextLevelXp.toLocaleString()} XP</span>
          </div>
          <div className="h-2 rounded-full bg-[#f5f4f1] overflow-hidden">
            <motion.div className="h-full rounded-full bg-[#1a1a1a]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
          </div>
          <p className="text-[10px] text-[#a3a3a3] mt-1">{xpForLevel(profile.level) - lvl.currentXp} XP to next level</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          ['Total Captures', profile.totalCaptures.toLocaleString()],
          ['Achievements', `${achDone}/${achievements.length}`],
          ['Day Streak', profile.currentStreak.toString()],
          ['Level', profile.level.toString()],
        ].map(([label, val]) => (
          <div key={label} className="card p-3">
            <div className="text-lg font-bold text-[#1a1a1a]">{val}</div>
            <div className="text-[10px] text-[#a3a3a3]">{label}</div>
          </div>
        ))}
      </div>

      {/* Rarity collection */}
      <div className="card p-4">
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Rarity Collection</h2>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(R_LABELS).map(([r,{label,color}]) => {
            const count = people.filter(p => p.rarity === r).length
            return (
              <div key={r} className="text-center">
                <div className="text-base font-bold" style={{color}}>{count}</div>
                <div className="text-[9px] font-medium text-[#a3a3a3]">{label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Favorite */}
      {fav && (
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-[#1a1a1a] mb-2">Favorite</h2>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f5f4f1]"><img src={fav.thumbnailData} alt={fav.nickname} className="w-full h-full object-cover" /></div>
            <div>
              <div className="text-sm font-semibold text-[#1a1a1a]">{fav.nickname}</div>
              <div className="text-xs font-medium" style={{color: R_LABELS[fav.rarity]?.color}}>{R_LABELS[fav.rarity]?.label} · {fav.xp} XP</div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-[#16a34a]" /><h2 className="text-sm font-semibold text-[#1a1a1a]">Privacy</h2></div>
        <p className="text-xs text-[#737373] leading-relaxed">All data stays on your device. No facial recognition. No identity matching. No uploads. Just anonymous collectibles.</p>
      </div>
    </div>
  )
}
