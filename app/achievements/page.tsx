'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { Lock, Gift, CheckCircle2 } from 'lucide-react'

const CAT: Record<string,string> = { captures:'Captures',collection:'Collection',exploration:'Exploration',mastery:'Mastery',special:'Special' }
const TIER: Record<number,string> = { 1:'text-[#737373]',2:'text-[#16a34a]',3:'text-[#2563eb]',4:'text-[#7c3aed]',5:'text-[#ea580c]' }

export default function AchievementsPage() {
  const { achievements, claimAchievement } = usePeopleDex()
  const [filter, setFilter] = useState<'all'|'completed'|'unclaimed'>('all')
  const completed = achievements.filter(a => a.completed).length
  const unclaimed = achievements.filter(a => a.completed && !a.claimed).length
  const total = achievements.length

  const filtered = achievements.filter(a => {
    if (filter === 'completed') return a.completed
    if (filter === 'unclaimed') return a.completed && !a.claimed
    return true
  })

  return (
    <div className="px-4 pt-10 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Achievements</h1>
        <p className="text-sm text-[#737373]">{completed}/{total} unlocked</p>
      </div>

      {/* Ring */}
      <div className="flex justify-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f5f4f1" strokeWidth="8" />
            <motion.circle cx="50" cy="50" r="42" fill="none" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(completed/total)*264} 264`} initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${(completed/total)*264} 264` }} transition={{ duration: 0.8 }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center"><div className="text-xl font-bold text-[#1a1a1a]">{completed}</div><div className="text-[10px] text-[#a3a3a3]">of {total}</div></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {(['all','completed','unclaimed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === f ? 'bg-[#1a1a1a] text-white' : 'bg-[#f5f4f1] text-[#737373]'}`}>
            {f === 'all' ? 'All' : f === 'completed' ? 'Completed' : `Claim (${unclaimed})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(a => (
          <motion.div key={a.id} className={`card p-4 ${a.completed && !a.claimed ? 'ring-1 ring-[#fde68a]' : ''}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${a.completed ? '' : 'opacity-20'}`}>{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className={`text-sm font-semibold ${a.completed ? 'text-[#1a1a1a]' : 'text-[#d4d0cb]'}`}>{a.title}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md bg-[#f5f4f1] font-medium ${TIER[a.tier]}`}>T{a.tier}</span>
                </div>
                <p className={`text-xs mt-0.5 ${a.completed ? 'text-[#737373]' : 'text-[#d4d0cb]'}`}>{a.description}</p>
                <span className="text-[10px] text-[#d4d0cb]">{CAT[a.category]}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-[#1a1a1a]">+{a.xpReward} XP</span>
                {a.completed && !a.claimed ? (
                  <motion.button onClick={() => claimAchievement(a.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="mt-1 px-3 py-1 rounded-lg bg-[#fef3c7] text-[#92400e] text-xs font-semibold flex items-center gap-1">
                    <Gift className="w-3 h-3" /> Claim
                  </motion.button>
                ) : a.completed ? <CheckCircle2 className="w-4 h-4 text-[#16a34a] mt-1 ml-auto" />
                : <Lock className="w-3 h-3 text-[#d4d0cb] mt-1 ml-auto" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
