'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { CheckCircle2, Gift, Send, X, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import type { PersonEntry } from '@/lib/types'

const ICONS: Record<string,string> = { daily:'📅', weekly:'📆', special:'🎯', visual:'🎨' }

interface AIQuest {
  id: string
  title: string
  description: string
  type: string
  xpReward: number
  completed: boolean
  claimed: boolean
  progress: number
  target: number
  category: string
}

export default function QuestsPage() {
  const { quests, claimQuest, people, profile, setProfile } = usePeopleDex()
  const [aiQuests, setAiQuests] = useState<AIQuest[]>([])
  const [generating, setGenerating] = useState(false)
  const [submittingQuest, setSubmittingQuest] = useState<any | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<PersonEntry | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyAnswer, setVerifyAnswer] = useState<'YES' | 'NO' | null>(null)

  const active = quests.filter(q => !q.claimed).sort((a,b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0))
  const done = quests.filter(q => q.claimed)
  const totalXp = done.reduce((s,q) => s + q.xpReward, 0)

  const generateQuests = async () => {
    setGenerating(true)
    try {
      const r = await fetch('/api/generate-quests', { method: 'POST' })
      const d = await r.json()
      if (d.quests?.length) {
        const newQuests: AIQuest[] = d.quests.map((q: any, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          title: q.title,
          description: q.description,
          type: q.type || 'visual',
          xpReward: q.xpReward || 150,
          completed: false,
          claimed: false,
          progress: 0,
          target: 1,
          category: 'special',
        }))
        setAiQuests(prev => [...newQuests, ...prev])
      }
    } catch {}
    setGenerating(false)
  }

  const handleSubmitQuest = async () => {
    if (!submittingQuest || !selectedPhoto) return
    setVerifying(true)
    setVerifyAnswer(null)
    try {
      const r = await fetch('/api/verify-quest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedPhoto.imageData,
          questTitle: submittingQuest.title,
          questDescription: submittingQuest.description,
          questType: submittingQuest.type || 'visual',
        }),
      })
      const d = await r.json()
      setVerifyAnswer(d.answer || 'NO')
    } catch { setVerifyAnswer('NO') }
    setVerifying(false)
  }

  const completeAiQuest = () => {
    if (!submittingQuest) return
    setAiQuests(prev => prev.map(q => q.id === submittingQuest.id ? { ...q, completed: true } : q))
    setSubmittingQuest(null); setSelectedPhoto(null); setVerifyAnswer(null)
  }

  const claimAiQuest = (id: string) => {
    const q = aiQuests.find(q => q.id === id)
    if (!q || !profile) return
    setProfile({ xp: profile.xp + q.xpReward, level: Math.floor(Math.log2((profile.xp + q.xpReward) / 100 + 1)) + 1 })
    setAiQuests(prev => prev.map(x => x.id === id ? { ...x, claimed: true } : x))
  }

  const closeSubmit = () => { setSubmittingQuest(null); setSelectedPhoto(null); setVerifyAnswer(null) }

  const allActive = [...aiQuests.filter(q => !q.claimed), ...active]

  return (
    <div className="px-4 pt-10 pb-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Quests</h1>
          <p className="text-sm text-[#737373]">Complete quests for bonus XP</p>
        </div>
        <button
          onClick={generateQuests}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-[#1a1a1a] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#404040] disabled:opacity-50 transition-colors"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Generate
        </button>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold text-[#1a1a1a]">{done.length + aiQuests.filter(q => q.claimed).length}<span className="text-sm font-normal text-[#a3a3a3]"> / {quests.length + aiQuests.length}</span></div>
          <div className="text-xs text-[#737373]">Completed</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-[#1a1a1a]">{totalXp.toLocaleString()}</div>
          <div className="text-xs text-[#737373]">XP earned</div>
        </div>
      </div>

      {allActive.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-3">🎉</div>
          <p className="text-sm font-medium text-[#1a1a1a]">All done!</p>
          <p className="text-xs text-[#a3a3a3] mt-0.5">Generate new quests or check back later</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allActive.map(q => {
            const isAi = q.id.startsWith('ai-')
            return (
              <motion.div key={q.id} className={`card p-4 ${q.completed ? 'ring-1 ring-[#fde68a]' : ''}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">{ICONS[q.category] || '🎯'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-[#1a1a1a]">{q.title}</h3>
                      {q.completed && <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />}
                      {isAi && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] font-medium">AI</span>}
                    </div>
                    <p className="text-xs text-[#737373] mt-0.5">{q.description}</p>

                    {!isAi && (q.type === 'captures_today' || q.type === 'unique_encounters' || q.type === 'different_locations') ? (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[#f5f4f1] overflow-hidden">
                          <motion.div className={`h-full rounded-full ${q.completed ? 'bg-[#f59e0b]' : 'bg-[#2563eb]'}`}
                            initial={{ width: 0 }} animate={{ width: `${Math.min((q.progress/q.target)*100, 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-[#a3a3a3] font-medium">{q.progress}/{q.target}</span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <button onClick={() => setSubmittingQuest(q)} className="text-xs font-semibold text-[#2563eb] flex items-center gap-1 hover:underline">
                          <Send className="w-3 h-3" /> Submit photo
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#1a1a1a]">+{q.xpReward} XP</span>
                    {q.completed && !q.claimed ? (
                      <motion.button onClick={() => isAi ? claimAiQuest(q.id) : claimQuest(q.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="mt-1.5 px-3 py-1 rounded-lg bg-[#fef3c7] text-[#92400e] text-xs font-semibold flex items-center gap-1">
                        <Gift className="w-3 h-3" /> Claim
                      </motion.button>
                    ) : q.completed && q.claimed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#16a34a] mt-1.5 ml-auto" />
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Submit modal */}
      <AnimatePresence>
        {submittingQuest && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={closeSubmit} />
            <motion.div className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
              initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
              <div className="p-4 border-b border-[#e6e4e0] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1a1a]">{submittingQuest.title}</h3>
                  <p className="text-xs text-[#737373]">{submittingQuest.description}</p>
                </div>
                <button onClick={closeSubmit}><X className="w-5 h-5 text-[#a3a3a3]" /></button>
              </div>
              {!selectedPhoto ? (
                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-xs text-[#737373] mb-3">Pick a photo from your collection:</p>
                  {people.length === 0 ? (
                    <p className="text-sm text-[#a3a3a3] text-center py-8">No photos yet. Capture some first!</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {people.map(p => (
                        <button key={p.id} onClick={() => setSelectedPhoto(p)}
                          className="aspect-square rounded-xl overflow-hidden bg-[#f5f4f1] ring-2 ring-transparent hover:ring-[#2563eb] transition-all">
                          <img src={p.thumbnailData} alt={p.nickname} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f5f4f1]"><img src={selectedPhoto.thumbnailData} alt="" className="w-full h-full object-cover" /></div>
                    <div>
                      <div className="text-sm font-semibold text-[#1a1a1a]">{selectedPhoto.nickname}</div>
                      <button onClick={() => setSelectedPhoto(null)} className="text-xs text-[#2563eb]">Change</button>
                    </div>
                  </div>
                  {verifyAnswer === null ? (
                    <button onClick={handleSubmitQuest} disabled={verifying}
                      className="w-full py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1d4ed8] disabled:opacity-60">
                      {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : <><Send className="w-4 h-4" /> Submit for Verification</>}
                    </button>
                  ) : verifyAnswer === 'YES' ? (
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
                      <div className="flex items-center gap-2 text-[#16a34a] mb-2"><CheckCircle2 className="w-5 h-5" /><span className="text-sm font-bold">Quest completed!</span></div>
                      <p className="text-xs text-[#737373]">AI confirms this photo satisfies the quest.</p>
                      <button onClick={completeAiQuest} className="mt-3 w-full py-2.5 rounded-xl bg-[#16a34a] text-white text-sm font-semibold flex items-center justify-center gap-1.5">
                        <Gift className="w-4 h-4" /> Complete & Claim +{submittingQuest.xpReward} XP
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4">
                      <div className="flex items-center gap-2 text-[#dc2626] mb-2"><AlertCircle className="w-5 h-5" /><span className="text-sm font-bold">Not a match</span></div>
                      <p className="text-xs text-[#737373]">AI doesn't see the required element. Try another photo.</p>
                      <button onClick={() => { setSelectedPhoto(null); setVerifyAnswer(null) }}
                        className="mt-3 w-full py-2.5 rounded-xl border border-[#fecaca] text-[#dc2626] text-sm font-semibold">Try another</button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {done.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide mb-2">Completed</h2>
          <div className="space-y-1">
            {done.map(q => (
              <div key={q.id} className="flex items-center gap-2 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-3 h-3 text-[#d4d0cb]" />
                <span className="text-xs text-[#a3a3a3]">{q.title}</span>
                <span className="text-[10px] text-[#d4d0cb] ml-auto">+{q.xpReward} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}