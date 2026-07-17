'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { levelFromXp, xpForLevel } from '@/lib/game-engine'
import { Edit3, Save, Shield } from 'lucide-react'

const R_LABELS: Record<string,{label:string;color:string}> = {
  common:{label:'Common',color:'#A1A1AA'},uncommon:{label:'Uncommon',color:'#10B981'},rare:{label:'Rare',color:'#6366F1'},
  epic:{label:'Epic',color:'#A855F7'},legendary:{label:'Legendary',color:'#F59E0B'},mythic:{label:'Mythic',color:'#EC4899'},
  ultrarare:{label:'Ultra Rare',color:'#06B6D4'},secret:{label:'Secret',color:'#FBBF24'},
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
    <div className="screen-shell space-y-5">
      {/* Header card */}
      <div className="glass p-6 text-center relative overflow-hidden" style={{ borderRadius: 'var(--radius-xl)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)' }} />

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          className="text-5xl inline-block cursor-pointer"
          onClick={() => {
            const i = EMOJIS.indexOf(profile.avatarEmoji)
            setProfile({ avatarEmoji: EMOJIS[(i + 1) % EMOJIS.length] })
          }}
        >
          {profile.avatarEmoji}
        </motion.button>
        <p className="text-[10px] text-zinc-600 mt-1">tap to change</p>

        {editing ? (
          <div className="flex items-center justify-center gap-2 mt-3">
            <input
              value={name} onChange={e => setName(e.target.value)} maxLength={20} autoFocus
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-100 text-center w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <button
              onClick={() => { setProfile({ username: name }); setEditing(false) }}
              className="p-1.5 rounded-lg cursor-pointer transition-colors"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#C7D2FE' }}
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mt-3">
            <h2 className="text-xl font-bold text-zinc-100">{profile.username}</h2>
            <button onClick={() => setEditing(true)} className="cursor-pointer"><Edit3 className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400" /></button>
          </div>
        )}

        <p className="text-xs text-zinc-500 mt-1">{profile.cosmetics.title}</p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Level {profile.level}</span>
            <span>{lvl.currentXp.toLocaleString()} / {lvl.nextLevelXp.toLocaleString()} XP</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366F1, #818CF8)' }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">{xpForLevel(profile.level) - lvl.currentXp} XP to next level</p>
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
          <div key={label} className="glass p-3">
            <div className="text-lg font-bold text-zinc-100">{val}</div>
            <div className="text-[10px] text-zinc-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Rarity collection */}
      <div className="glass p-4">
        <h2 className="text-sm font-semibold text-zinc-200 mb-3">Rarity Collection</h2>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(R_LABELS).map(([r,{label,color}]) => {
            const count = people.filter(p => p.rarity === r).length
            return (
              <div key={r} className="text-center">
                <div className="text-base font-bold" style={{color}}>{count}</div>
                <div className="text-[9px] font-medium text-zinc-500">{label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Favorite */}
      {fav && (
        <div className="glass p-4">
          <h2 className="text-sm font-semibold text-zinc-200 mb-2">Favorite</h2>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <img src={fav.thumbnailData} alt={fav.nickname} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100">{fav.nickname}</div>
              <div className="text-xs font-medium" style={{color: R_LABELS[fav.rarity]?.color}}>{R_LABELS[fav.rarity]?.label} · {fav.xp} XP</div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy */}
      <div className="glass p-4 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-200">Privacy</h2>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">All data stays on your device. No facial recognition. No identity matching. No uploads. Just anonymous collectibles.</p>
      </div>
    </div>
  )
}
