'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePeopleDex } from '@/lib/peopledex-context'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Check, Loader2, AlertCircle, Shirt } from 'lucide-react'

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [count, setCount] = useState(0)
  const [flash, setFlash] = useState(false)
  const [timerOn, setTimerOn] = useState(false)
  const [timerVal, setTimerVal] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { capturePerson } = usePeopleDex()

  useEffect(() => {
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        videoRef.current!.srcObject = s
        streamRef.current = s
        setReady(true)
      } catch {
        setError('Camera access denied')
      }
    }
    start()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  const doCapture = () => {
    const v = videoRef.current
    if (!v) return
    const c = document.createElement('canvas')
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d')!.drawImage(v, 0, 0)
    setCaptured(c.toDataURL('image/jpeg', 0.9))
    setResult(null)
    setFlash(true); setTimeout(() => setFlash(false), 120)
  }

  const takePhoto = useCallback(() => {
    if (timerOn) {
      let val = 3
      setTimerVal(val)
      timerRef.current = setInterval(() => {
        val--
        if (val <= 0) {
          clearInterval(timerRef.current!)
          setTimerVal(null)
          doCapture()
        } else {
          setTimerVal(val)
        }
      }, 800)
    } else {
      doCapture()
    }
  }, [timerOn])

  const verify = useCallback(async () => {
    if (!captured) return
    setVerifying(true)
    try {
      const r = await fetch('/api/verify-person', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: captured }),
      })
      const d = await r.json()
      if (d.error) setResult(`API error: ${d.error}`)
      else if (d.isPerson && d.fullBody) setResult('ok')
      else if (d.isPerson) setResult('partial')
      else setResult('no')
    } catch (e: any) { setResult(`Error: ${e.message}`) }
    setVerifying(false)
  }, [captured])

  const save = useCallback(async () => {
    if (!captured) return
    setSaving(true)
    const thumb = document.createElement('canvas'); thumb.width = 200; thumb.height = 200
    const img = new Image()
    await new Promise<void>(r => { img.onload = () => {
      const s = Math.min(img.width, img.height); const sx = (img.width-s)/2; const sy = (img.height-s)/2
      thumb.getContext('2d')!.drawImage(img, sx, sy, s, s, 0, 0, 200, 200); r()
    }; img.src = captured })
    await capturePerson(captured, thumb.toDataURL('image/jpeg', 0.7))
    setCount(c => c + 1)
    setSaving(false); setCaptured(null); setResult(null)
  }, [captured, capturePerson])

  const dismiss = () => { setCaptured(null); setResult(null) }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {error ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#faf9f7] p-8 text-center">
          <AlertCircle className="w-10 h-10 text-[#dc2626] mb-3" />
          <p className="text-sm text-[#737373]">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 rounded-xl bg-[#1a1a1a] text-white text-sm font-medium">Retry</button>
        </div>
      ) : !ready ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#faf9f7]">
          <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin mb-3" />
          <p className="text-sm text-[#737373]">Starting camera...</p>
        </div>
      ) : null}

      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

      <AnimatePresence>
        {flash && <motion.div className="absolute inset-0 z-10 bg-white" initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 0.1 }} />}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-4 inset-x-4 z-10 flex justify-between items-start">
        <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs text-[#1a1a1a] font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" /> Live
        </div>
        {count > 0 && (
          <motion.div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs text-[#1a1a1a] font-medium" initial={{ scale: 0 }} animate={{ scale: 1 }}>+{count}</motion.div>
        )}
      </div>

      {/* Capture controls */}
      {!captured && ready && (
        <div className="absolute bottom-10 inset-x-0 z-10 flex flex-col items-center gap-4">
          {/* Timer toggle */}
          <button
            onClick={() => setTimerOn(!timerOn)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${timerOn ? 'bg-white text-[#1a1a1a]' : 'bg-white/40 text-white/80'}`}
          >
            {timerOn ? 'Timer: ON' : 'Timer: OFF'}
          </button>
          {/* Capture button */}
          <motion.button
            onClick={takePhoto}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-white/30"
          >
            <div className="w-[68px] h-[68px] rounded-full border-3 border-[#1a1a1a]" />
          </motion.button>
        </div>
      )}

      {/* Countdown overlay */}
      <AnimatePresence>
        {timerVal !== null && (
          <motion.div
            key={timerVal}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30"
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-[120px] font-black text-white drop-shadow-2xl">{timerVal}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm dialog */}
      <AnimatePresence>
        {captured && (
          <motion.div className="absolute inset-0 z-30 flex items-end justify-center pb-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={dismiss} />
            <motion.div
              className="relative w-[92vw] max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl"
              initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="aspect-[4/5] bg-[#f5f4f1] relative">
                <img src={captured} alt="Photo" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[#1a1a1a]">Photo taken</h3>
                <p className="text-xs text-[#737373] mt-0.5">Verify with AI to add to collection</p>

                {!result ? (
                  <button onClick={verify} disabled={verifying}
                    className="mt-3 w-full py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1d4ed8] disabled:opacity-60">
                    {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><Shirt className="w-4 h-4" /> Verify Full Body</>}
                  </button>
                ) : result === 'ok' ? (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-[#16a34a] mb-3"><Check className="w-4 h-4" /><span className="text-sm font-semibold">Full body person confirmed</span></div>
                    <div className="flex gap-2">
                      <button onClick={dismiss} className="flex-1 py-2.5 rounded-xl border border-[#e6e4e0] text-sm text-[#737373]">Retake</button>
                      <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Add to Collection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-[#dc2626] mb-3"><AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">{result === 'partial' ? 'Partial body — need full body' : result === 'no' ? 'No person detected' : result}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={dismiss} className="flex-1 py-2.5 rounded-xl border border-[#e6e4e0] text-sm text-[#737373]">Retake</button>
                      {!result?.startsWith('API') && <button onClick={verify} className="flex-1 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold">Retry Verify</button>}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}