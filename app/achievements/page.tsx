'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { Lock, Gift, CheckCircle2 } from 'lucide-react'

const CAT: Record<string,string> = { captures:'Captures',collection:'Collection',exploration:'Exploration',mastery:'Mastery',special:'Special' }
const TIER: Record<number,string> = { 1:'text-zinc-400',2:'text-emerald-400',3:'text-indigo-400',4:'text-purple-400',5:'text-amber-400' }

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
    <div className="px-4 pt-12 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Achievements</h1>
        <p className="text-sm text-zinc-500">{completed}/{total} unlocked</p>
      </div>

      {/* Progress ring */}
      <div className="flex justify-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#achGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(completed/total)*264} 264`}
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${(completed/total)*264} 264` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="achGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-zinc-100">{completed}</div>
              <div className="text-[10px] text-zinc-500">of {total}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {(['all','completed','unclaimed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === f ? 'text-white' : 'text-zinc-400'
            }`}
            style={filter === f ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            {f === 'all' ? 'All' : f === 'completed' ? 'Completed' : `Claim (${unclaimed})`}
          </button>
        ))}
      </div>

      <div className="space-y-2 pb-2">
        {filtered.map(a => (
          <motion.div
            key={a.id}
            className={`glass p-4 ${a.completed && !a.claimed ? 'gradient-border' : ''}`}
            style={a.completed && !a.claimed ? { borderRadius: 'var(--radius-xl)' } : {}}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${a.completed ? '' : 'opacity-20'}`}>{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className={`text-sm font-semibold ${a.completed ? 'text-zinc-100' : 'text-zinc-600'}`}>{a.title}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${TIER[a.tier]}`} style={{ background: 'rgba(255,255,255,0.04)' }}>T{a.tier}</span>
                </div>
                <p className={`text-xs mt-0.5 ${a.completed ? 'text-zinc-500' : 'text-zinc-600'}`}>{a.description}</p>
                <span className="text-[10px] text-zinc-600">{CAT[a.category]}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-zinc-200">+{a.xpReward} XP</span>
                {a.completed && !a.claimed ? (
                  <motion.button
                    onClick={() => claimAchievement(a.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-1 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)', color: '#FBBF24' }}
                  >
                    <Gift className="w-3 h-3" /> Claim
                  </motion.button>
                ) : a.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 ml-auto" />
                ) : (
                  <Lock className="w-3 h-3 text-zinc-600 mt-1 ml-auto" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}