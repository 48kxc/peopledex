'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import { usePeopleDex } from '@/lib/peopledex-context'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Check, Loader2, AlertCircle, Shirt, User } from 'lucide-react'

interface DetectedBox {
  bbox: [number, number, number, number]
  score: number
  id: number
}

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [detected, setDetected] = useState<DetectedBox[]>([])
  const [detecting, setDetecting] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<DetectedBox | null>(null)
  const [cropped, setCropped] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [count, setCount] = useState(0)
  const [flash, setFlash] = useState(false)
  const [timerOn, setTimerOn] = useState(false)
  const [timerVal, setTimerVal] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const modelRef = useRef<any>(null)
  const [modelReady, setModelReady] = useState(false)
  const { capturePerson } = usePeopleDex()

  // Camera
  useEffect(() => {
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        videoRef.current!.srcObject = s; streamRef.current = s; setReady(true)
      } catch { setError('Camera access denied') }
    }
    start()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  // Load TF model
  useEffect(() => {
    (async () => {
      try {
        await tf.ready()
        const m = await (await import('@tensorflow-models/coco-ssd')).load({ base: 'lite_mobilenet_v2' })
        modelRef.current = m; setModelReady(true)
      } catch { /* model optional, will show as unavailable */ }
    })()
  }, [])

  // Capture photo
  const doCapture = () => {
    const v = videoRef.current
    if (!v) return
    const c = document.createElement('canvas')
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d')!.drawImage(v, 0, 0)
    const dataUrl = c.toDataURL('image/jpeg', 0.9)
    setCaptured(dataUrl); setDetected([]); setSelectedPerson(null); setCropped(null); setResult(null)
    setFlash(true); setTimeout(() => setFlash(false), 120)

    // Run detection on captured photo
    if (modelRef.current) {
      setDetecting(true)
      setTimeout(async () => {
        try {
          const img = new Image()
          await new Promise<void>(r => { img.onload = () => r(); img.src = dataUrl })
          const preds = await modelRef.current.detect(img)
          const people = preds
            .filter((p: any) => p.class === 'person' && p.score > 0.3)
            .map((p: any, i: number) => ({ bbox: p.bbox as [number,number,number,number], score: p.score, id: i }))
          setDetected(people)
        } catch {}
        setDetecting(false)
      }, 300)
    }
  }

  const takePhoto = useCallback(() => {
    if (timerOn) {
      let val = 3; setTimerVal(val)
      timerRef.current = setInterval(() => {
        val--
        if (val <= 0) { clearInterval(timerRef.current!); setTimerVal(null); doCapture() }
        else { setTimerVal(val) }
      }, 800)
    } else { doCapture() }
  }, [timerOn])

  // Select a detected person and crop
  const selectPerson = useCallback((box: DetectedBox) => {
    setSelectedPerson(box)
    const img = new Image()
    img.onload = () => {
      const [x, y, w, h] = box.bbox
      const pad = 0.15
      const px = Math.max(0, x - w * pad)
      const py = Math.max(0, y - h * pad * 0.5)
      const pw = Math.min(img.width - px, w * (1 + pad * 2))
      const ph = Math.min(img.height - py, h * (1 + pad * 1.5))
      const c = document.createElement('canvas'); c.width = pw; c.height = ph
      c.getContext('2d')!.drawImage(img, px, py, pw, ph, 0, 0, pw, ph)
      setCropped(c.toDataURL('image/jpeg', 0.9))
    }
    img.src = captured!
  }, [captured])

  // Verify with AI
  const verify = useCallback(async () => {
    if (!(cropped || captured)) return
    setVerifying(true)
    try {
      const r = await fetch('/api/verify-person', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: cropped || captured }),
      })
      const d = await r.json()
      if (d.error) setResult(`API error: ${d.error}`)
      else if (d.isPerson) setResult('ok')
      else setResult('no')
    } catch (e: any) { setResult(`Error: ${e.message}`) }
    setVerifying(false)
  }, [cropped, captured])

  // Save
  const save = useCallback(async () => {
    const imgData = cropped || captured
    if (!imgData) return
    setSaving(true)
    const thumb = document.createElement('canvas'); thumb.width = 200; thumb.height = 200
    const img = new Image()
    await new Promise<void>(r => { img.onload = () => {
      const s = Math.min(img.width, img.height); const sx = (img.width-s)/2; const sy = (img.height-s)/2
      thumb.getContext('2d')!.drawImage(img, sx, sy, s, s, 0, 0, 200, 200); r()
    }; img.src = imgData })
    await capturePerson(imgData, thumb.toDataURL('image/jpeg', 0.7))
    setCount(c => c + 1)
    setSaving(false); setCaptured(null); setDetected([]); setSelectedPerson(null); setCropped(null); setResult(null)
  }, [cropped, captured, capturePerson])

  const dismiss = () => { setCaptured(null); setDetected([]); setSelectedPerson(null); setCropped(null); setResult(null); timerRef.current && clearInterval(timerRef.current) }

  // Draw detection boxes on the photo
  const drawBoxes = (boxes: DetectedBox[], imgW: number, imgH: number) => {
    return boxes.map(b => {
      const [x, y, w, h] = b.bbox
      const isSelected = selectedPerson?.id === b.id
      return (
        <button
          key={b.id}
          onClick={() => selectPerson(b)}
          className="absolute border-2 rounded-lg transition-all cursor-pointer"
          style={{
            left: `${(x / imgW) * 100}%`,
            top: `${(y / imgH) * 100}%`,
            width: `${(w / imgW) * 100}%`,
            height: `${(h / imgH) * 100}%`,
            borderColor: isSelected ? '#6366F1' : `rgba(99,102,241,0.5)`,
            backgroundColor: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent',
            boxShadow: isSelected ? '0 0 0 2px rgba(99,102,241,0.4)' : 'none',
          }}
        >
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold whitespace-nowrap" style={{ background: 'rgba(99,102,241,0.9)' }}>
            Person {Math.round(b.score * 100)}%
          </span>
          {isSelected && (
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-white flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.9)' }}>
              <Check className="w-5 h-5" />
            </span>
          )}
        </button>
      )
    })
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {error ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center" style={{ background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(12px)' }}>
          <AlertCircle className="w-10 h-10 text-[#dc2626] mb-3" />
          <p className="text-sm text-zinc-400">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 rounded-xl text-white text-sm font-medium cursor-pointer" style={{ background: 'rgba(99,102,241,0.8)' }}>Retry</button>
        </div>
      ) : !ready ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center" style={{ background: 'rgba(9,9,11,0.95)' }}>
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-sm text-zinc-400">Starting camera...</p>
        </div>
      ) : null}

      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <AnimatePresence>{flash && <motion.div className="absolute inset-0 z-10 bg-white" initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 0.1 }} />}</AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-4 inset-x-4 z-10 flex justify-between items-start">
        <div className="px-3 py-1.5 rounded-full text-xs text-zinc-200 font-medium flex items-center gap-1.5" style={{ background: 'rgba(24,24,27,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live {modelReady && '· AI'}
        </div>
        {count > 0 && <motion.div className="px-3 py-1.5 rounded-full text-xs text-zinc-200 font-medium" style={{ background: 'rgba(24,24,27,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }} initial={{ scale: 0 }} animate={{ scale: 1 }}>+{count}</motion.div>}
      </div>

      {/* Capture button */}
      {!captured && ready && (
        <div className="absolute bottom-10 inset-x-0 z-10 flex flex-col items-center gap-4">
          <button onClick={() => setTimerOn(!timerOn)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${timerOn ? 'bg-white text-[#09090B]' : 'text-white/60'}`} style={{ background: timerOn ? 'white' : 'rgba(255,255,255,0.1)', border: timerOn ? 'none' : '1px solid rgba(255,255,255,0.15)' }}>
            {timerOn ? 'Timer: ON' : 'Timer: OFF'}
          </button>
          <motion.button onClick={takePhoto} whileTap={{ scale: 0.9 }} className="w-20 h-20 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-white/30">
            <div className="w-[68px] h-[68px] rounded-full" style={{ border: '3px solid rgba(255,255,255,0.2)' }} />
          </motion.button>
        </div>
      )}

      {/* Countdown */}
      <AnimatePresence>
        {timerVal !== null && (
          <motion.div key={timerVal} className="absolute inset-0 z-20 flex items-center justify-center bg-black/30" initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
            <div className="text-[120px] font-black text-white drop-shadow-2xl">{timerVal}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo review with person selection */}
      <AnimatePresence>
        {captured && (
          <motion.div className="absolute inset-0 z-30 flex flex-col bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Image with detection boxes */}
            <div className="flex-1 relative flex items-center justify-center">
              <div className="relative inline-block max-h-full">
                <img src={captured} alt="Captured" className="max-h-[70vh] max-w-full object-contain" />
                {detected.length > 0 && drawBoxes(detected, videoRef.current?.videoWidth || 1280, videoRef.current?.videoHeight || 720)}
                {detecting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
                {!detecting && detected.length === 0 && modelReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <p className="text-white/60 text-sm">No people detected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom panel */}
            <div className="rounded-t-3xl p-5 shadow-2xl" style={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
              <h3 className="text-sm font-semibold text-zinc-100">
                {selectedPerson ? 'Person selected' : detected.length > 0 ? `${detected.length} people detected — tap one` : 'Photo captured'}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedPerson ? 'Tap Verify to confirm with AI' : detected.length > 0 ? 'Select a person to crop and verify' : 'Tap Verify to check whole photo'}
              </p>

              {!result ? (
                <div className="flex gap-2 mt-3">
                  <button onClick={dismiss} className="flex-1 py-2.5 rounded-xl text-sm text-zinc-400 font-medium cursor-pointer transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Retake</button>
                  <button onClick={verify} disabled={verifying} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer" style={{ background: 'rgba(99,102,241,0.8)' }}>
                    {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <><Shirt className="w-4 h-4" /> Verify</>}
                  </button>
                </div>
              ) : result === 'ok' ? (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-emerald-400 mb-3"><Check className="w-4 h-4" /><span className="text-sm font-semibold">Person confirmed</span></div>
                  <div className="flex gap-2">
                    <button onClick={dismiss} className="flex-1 py-2.5 rounded-xl text-sm text-zinc-400 cursor-pointer" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
                    <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer" style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)' }}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Add to Collection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-red-400 mb-3"><AlertCircle className="w-4 h-4" /><span className="text-sm font-semibold">{result === 'no' ? 'No person detected' : result}</span></div>
                  <div className="flex gap-2">
                    <button onClick={dismiss} className="flex-1 py-2.5 rounded-xl text-sm text-zinc-400 cursor-pointer" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Retake</button>
                    {!result?.startsWith('API') && <button onClick={verify} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer" style={{ background: 'rgba(99,102,241,0.8)' }}>Retry</button>}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}