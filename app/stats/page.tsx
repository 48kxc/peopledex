'use client'

import { motion } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { levelFromXp } from '@/lib/game-engine'
import { Users, Zap, Trophy, MapPin } from 'lucide-react'

const R_LABELS: Record<string,{label:string;color:string}> = {
  common:{label:'Common',color:'#A1A1AA'},uncommon:{label:'Uncommon',color:'#10B981'},rare:{label:'Rare',color:'#6366F1'},
  epic:{label:'Epic',color:'#A855F7'},legendary:{label:'Legendary',color:'#F59E0B'},mythic:{label:'Mythic',color:'#EC4899'},
  ultrarare:{label:'Ultra Rare',color:'#06B6D4'},secret:{label:'Secret',color:'#FBBF24'},
}

export default function StatsPage() {
  const { profile, people, stats, achievements } = usePeopleDex()
  if (!profile || !stats) return null

  const lvl = levelFromXp(profile.xp)
  const today = new Date().toISOString().slice(0,10)
  const wkAgo = new Date(Date.now()-7*86400000).toISOString().slice(0,10)
  const todayCount = stats.capturesByDay[today] || 0
  const wkCount = Object.entries(stats.capturesByDay).filter(([d]) => d >= wkAgo).reduce((s,[,c]) => s + c, 0)
  const entries = Object.entries(stats.capturesByRarity).filter(([,c]) => c > 0)
  const totalR = entries.reduce((s,[,c]) => s + c, 0)
  const maxH = Math.max(...stats.capturesByHour, 1)
  const peakH = maxH > 0 ? stats.capturesByHour.indexOf(maxH) : -1
  const achDone = achievements.filter(a => a.completed).length

  return (
    <div className="px-4 pt-12 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Statistics</h1>
        <p className="text-sm text-zinc-500">Your collection data</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={Users} label="Total Captures" value={profile.totalCaptures.toLocaleString()} />
        <StatCard icon={Users} label="Unique People" value={people.length.toLocaleString()} />
        <StatCard icon={Users} label="Today" value={todayCount.toString()} />
        <StatCard icon={Users} label="This Week" value={wkCount.toString()} />
        <StatCard icon={Zap} label="Total XP" value={profile.xp.toLocaleString()} />
        <StatCard icon={Trophy} label="Level" value={profile.level.toString()} />
      </div>

      {/* Rarity */}
      <div className="glass p-4">
        <h2 className="text-sm font-semibold text-zinc-200 mb-3">Rarity Distribution</h2>
        <div className="space-y-2">
          {entries.map(([r,c]) => {
            const pct = (c/totalR)*100
            const cl = R_LABELS[r] || R_LABELS.common
            return (
              <div key={r} className="flex items-center gap-2">
                <span className="text-xs font-medium w-20" style={{color:cl.color}}>{cl.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full" style={{backgroundColor:cl.color,width:`${pct}%`}} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
                </div>
                <span className="text-xs text-zinc-500 w-6 text-right">{c}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hourly */}
      <div className="glass p-4">
        <h2 className="text-sm font-semibold text-zinc-200 mb-3">
          Capture Time
          <span className="text-xs font-normal text-zinc-500 ml-1">Peak: {peakH >= 0 ? `${peakH}:00` : 'N/A'}</span>
        </h2>
        <div className="flex items-end gap-[2px] h-20">
          {stats.capturesByHour.map((c, h) => {
            const hh = maxH > 0 ? (c/maxH)*100 : 0
            return (
              <div key={h} className="flex-1 flex flex-col items-center gap-0.5">
                <motion.div
                  className="w-full rounded-t-sm"
                  style={{ background: h === peakH ? '#6366F1' : 'rgba(99,102,241,0.3)' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(hh, 1)}%` }}
                  transition={{ duration: 0.3, delay: h * 0.005 }}
                />
                {h % 6 === 0 && <span className="text-[8px] text-zinc-600">{h}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Streaks & extras */}
      <div className="grid grid-cols-2 gap-2 pb-2">
        <div className="glass p-4">
          <div className="text-xs text-zinc-500 mb-1">Current Streak</div>
          <div className="text-xl font-bold text-amber-400">{profile.currentStreak} 🔥</div>
          <div className="text-[10px] text-zinc-500">days</div>
        </div>
        <div className="glass p-4">
          <div className="text-xs text-zinc-500 mb-1">Longest Streak</div>
          <div className="text-xl font-bold text-amber-400">{profile.longestStreak} ⭐</div>
          <div className="text-[10px] text-zinc-500">days</div>
        </div>
        <div className="glass p-4">
          <div className="text-xs text-zinc-500 mb-1">Locations</div>
          <div className="text-xl font-bold text-emerald-400">{stats.locationCount} 📍</div>
          <div className="text-[10px] text-zinc-500">visited</div>
        </div>
        <div className="glass p-4">
          <div className="text-xs text-zinc-500 mb-1">Achievements</div>
          <div className="text-xl font-bold text-purple-400">{achDone} 🏆</div>
          <div className="text-[10px] text-zinc-500">unlocked</div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="glass p-3">
      <Icon className="w-4 h-4 text-zinc-500 mb-1" />
      <div className="text-base font-bold text-zinc-100">{value}</div>
      <div className="text-[10px] text-zinc-500">{label}</div>
    </div>
  )
}