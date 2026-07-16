'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'
import { CheckCircle2, Gift, Send, Image, X, Loader2, AlertCircle } from 'lucide-react'
import type { Quest, PersonEntry } from '@/lib/types'

const ICONS: Record<string,string> = { daily:'📅', weekly:'📆', special:'🎯' }

export default function QuestsPage() {
  const { quests, claimQuest, people } = usePeopleDex()
  const [submittingQuest, setSubmittingQuest] = useState<Quest | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<PersonEntry | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyAnswer, setVerifyAnswer] = useState<'YES' | 'NO' | null>(null)
  const [verifyRaw, setVerifyRaw] = useState<string | null>(null)

  const active = quests.filter(q => !q.claimed).sort((a,b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0))
  const done = quests.filter(q => q.claimed)
  const totalXp = done.reduce((s,q) => s + q.xpReward, 0)

  const handleSubmitQuest = async () => {
    if (!submittingQuest || !selectedPhoto) return
    setVerifying(true)
    setVerifyAnswer(null)
    setVerifyRaw(null)
    try {
      const res = await fetch('/api/verify-quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedPhoto.imageData,
          questTitle: submittingQuest.title,
          questDescription: submittingQuest.description,
          questType: submittingQuest.type,
        }),
      })
      const data = await res.json()
      setVerifyAnswer(data.answer || 'NO')
      setVerifyRaw(data.raw || '')
    } catch (e: any) {
      setVerifyAnswer('NO')
      setVerifyRaw(`Error: ${e.message}`)
    }
    setVerifying(false)
  }

  const handleClaimAfterVerify = () => {
    if (submittingQuest) {
      claimQuest(submittingQuest.id)
      setSubmittingQuest(null)
      setSelectedPhoto(null)
      setVerifyAnswer(null)
    }
  }

  const closeSubmit = () => {
    setSubmittingQuest(null)
    setSelectedPhoto(null)
    setVerifyAnswer(null)
    setVerifyRaw(null)
  }

  return (
    <div className="px-4 pt-10 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Quests</h1>
        <p className="text-sm text-[#737373]">Complete quests for bonus XP</p>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold text-[#1a1a1a]">{done.length}<span className="text-sm font-normal text-[#a3a3a3]"> / {quests.length}</span></div>
          <div className="text-xs text-[#737373]">Completed</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-[#1a1a1a]">{totalXp.toLocaleString()}</div>
          <div className="text-xs text-[#737373]">XP earned</div>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-3">🎉</div>
          <p className="text-sm font-medium text-[#1a1a1a]">All done!</p>
          <p className="text-xs text-[#a3a3a3] mt-0.5">Check back for new quests</p>
        </div>
      ) : (
        <div className="space-y-2">
          {active.map(q => (
            <motion.div key={q.id} className={`card p-4 ${q.completed ? 'ring-1 ring-[#fde68a]' : ''}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{ICONS[q.category]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-[#1a1a1a]">{q.title}</h3>
                    {q.completed && <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />}
                  </div>
                  <p className="text-xs text-[#737373] mt-0.5">{q.description}</p>

                  {/* Auto progress bar */}
                  {q.type === 'captures_today' || q.type === 'unique_encounters' || q.type === 'different_locations' ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#f5f4f1] overflow-hidden">
                        <motion.div className={`h-full rounded-full ${q.completed ? 'bg-[#f59e0b]' : 'bg-[#2563eb]'}`}
                          initial={{ width: 0 }} animate={{ width: `${Math.min((q.progress/q.target)*100, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-[#a3a3a3] font-medium">{q.progress}/{q.target}</span>
                    </div>
                  ) : (
                    /* Manual submit quests */
                    <div className="mt-2">
                      <button
                        onClick={() => setSubmittingQuest(q)}
                        className="text-xs font-semibold text-[#2563eb] flex items-center gap-1 hover:underline"
                      >
                        <Send className="w-3 h-3" /> Submit photo for verification
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1a1a1a]">+{q.xpReward} XP</span>
                  {q.completed && !q.claimed ? (
                    <motion.button onClick={() => claimQuest(q.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="mt-1.5 px-3 py-1 rounded-lg bg-[#fef3c7] text-[#92400e] text-xs font-semibold flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Claim
                    </motion.button>
                  ) : q.completed && q.claimed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] mt-1.5 ml-auto" />
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit modal */}
      <AnimatePresence>
        {submittingQuest && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={closeSubmit} />
            <motion.div
              className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
              initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-4 border-b border-[#e6e4e0] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1a1a]">Submit for: {submittingQuest.title}</h3>
                  <p className="text-xs text-[#737373]">{submittingQuest.description}</p>
                </div>
                <button onClick={closeSubmit}><X className="w-5 h-5 text-[#a3a3a3]" /></button>
              </div>

              {!selectedPhoto ? (
                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-xs text-[#737373] mb-3">Pick a photo from your collection:</p>
                  {people.length === 0 ? (
                    <p className="text-sm text-[#a3a3a3] text-center py-8">No photos in collection yet. Capture some first!</p>
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
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f5f4f1]">
                      <img src={selectedPhoto.thumbnailData} alt={selectedPhoto.nickname} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1a1a1a]">{selectedPhoto.nickname}</div>
                      <button onClick={() => setSelectedPhoto(null)} className="text-xs text-[#2563eb]">Change photo</button>
                    </div>
                  </div>

                  {verifyAnswer === null ? (
                    <button onClick={handleSubmitQuest} disabled={verifying}
                      className="w-full py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1d4ed8] disabled:opacity-60 transition-colors">
                      {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> AI is checking...</> : <><Send className="w-4 h-4" /> Submit for Verification</>}
                    </button>
                  ) : (
                    <div>
                      {verifyAnswer === 'YES' ? (
                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 mb-3">
                          <div className="flex items-center gap-2 text-[#16a34a] mb-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-bold">Quest completed!</span>
                          </div>
                          <p className="text-xs text-[#737373]">AI confirms this photo satisfies the quest requirements.</p>
                          <button onClick={handleClaimAfterVerify} className="mt-3 w-full py-2.5 rounded-xl bg-[#16a34a] text-white text-sm font-semibold flex items-center justify-center gap-1.5">
                            <Gift className="w-4 h-4" /> Claim +{submittingQuest.xpReward} XP
                          </button>
                        </div>
                      ) : (
                        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 mb-3">
                          <div className="flex items-center gap-2 text-[#dc2626] mb-2">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-bold">Not a match</span>
                          </div>
                          <p className="text-xs text-[#737373]">AI determined this photo doesn't satisfy the quest. Try a different photo.</p>
                          <button onClick={() => { setSelectedPhoto(null); setVerifyAnswer(null) }}
                            className="mt-3 w-full py-2.5 rounded-xl border border-[#fecaca] text-[#dc2626] text-sm font-semibold">
                            Try another photo
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed */}
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
