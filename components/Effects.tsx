'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePeopleDex } from '@/lib/peopledex-context'

const R_LABELS: Record<string,{label:string;color:string}> = {
  common:{label:'Common',color:'#737373'},uncommon:{label:'Uncommon',color:'#16a34a'},rare:{label:'Rare',color:'#2563eb'},
  epic:{label:'Epic',color:'#7c3aed'},legendary:{label:'Legendary',color:'#ea580c'},mythic:{label:'Mythic',color:'#db2777'},
  ultrarare:{label:'Ultra Rare',color:'#0891b2'},secret:{label:'Secret',color:'#ca8a04'},
}

export default function XPPopup() {
  const { xpPopup, setXpPopup } = usePeopleDex()
  return (
    <AnimatePresence>
      {xpPopup && (
        <motion.div key={xpPopup.key} className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: -10, scale: 1 }} exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => setTimeout(() => setXpPopup(null), 1500)}>
          <div className="px-4 py-2 rounded-xl bg-[#1a1a1a] text-white text-sm font-semibold shadow-lg">+{xpPopup.amount} XP</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function RarityReveal() {
  const { rarityReveal, setRarityReveal } = usePeopleDex()
  return (
    <AnimatePresence>
      {rarityReveal && (
        <motion.div key={rarityReveal.key} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onAnimationComplete={() => setTimeout(() => setRarityReveal(null), 2000)}>
          <motion.div className="text-center" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}>
            <div className="text-5xl mb-2">
              {rarityReveal.rarity === 'common' ? '📸' : rarityReveal.rarity === 'uncommon' ? '✨' : rarityReveal.rarity === 'rare' ? '💎' :
               rarityReveal.rarity === 'epic' ? '🌟' : rarityReveal.rarity === 'legendary' ? '⭐' : rarityReveal.rarity === 'mythic' ? '🔥' :
               rarityReveal.rarity === 'ultrarare' ? '👑' : '🌈'}
            </div>
            <div className="text-xl font-bold" style={{color: R_LABELS[rarityReveal.rarity]?.color}}>
              {R_LABELS[rarityReveal.rarity]?.label}!
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Confetti() {
  const { rarityReveal } = usePeopleDex()
  if (!rarityReveal || rarityReveal.rarity === 'common') return null
  const colors = ['#2563eb','#7c3aed','#db2777','#f59e0b','#16a34a','#ea580c','#0891b2']
  const pieces = Array.from({length: 24}, (_,i) => ({
    id:i, x:Math.random()*100, color:colors[i%colors.length], size:Math.random()*6+3, delay:Math.random()*0.4, dur:Math.random()*1+1
  }))
  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {pieces.map(p => (
        <motion.div key={p.id} className="absolute top-1/2 rounded-full" style={{left:`${p.x}%`,width:p.size,height:p.size,backgroundColor:p.color}}
          initial={{y:0,x:0,opacity:1,scale:1}}
          animate={{y:[0,-150-Math.random()*200],x:[0,(Math.random()-0.5)*150],opacity:[1,0],scale:[1,0]}}
          transition={{duration:p.dur,delay:p.delay,ease:'easeOut'}} />
      ))}
    </div>
  )
}
