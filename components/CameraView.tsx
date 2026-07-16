'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import { usePeopleDex } from '@/lib/peopledex-context'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Check, Loader2, AlertCircle, Shirt } from 'lucide-react'

interface DetectedPerson {
  id: string
  bbox: [number, number, number, number]
  score: number
  stableFrames: number
}

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [detected, setDetected] = useState<DetectedPerson[]>([])
  const [confirming, setConfirming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [capturedCount, setCapturedCount] = useState(0)
  const [flash, setFlash] = useState(false)
  const modelRef = useRef<any>(null)
  const frameRef = useRef(0)
  const stableRequired = 30 // frames (~1s)
  const capturedRef = useRef(new Set<string>())
  const { capturePerson } = usePeopleDex()

  // Camera
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
        setError('Camera access denied.')
        setLoading(false)
      }
    }
    start()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); cancelAnimationFrame(frameRef.current) }
  }, [])

  // Model
  useEffect(() => {
    async function load() {
      try {
        await tf.ready()
        const m = await (await import('@tensorflow-models/coco-ssd')).load({ base: 'lite_mobilenet_v2' })
        modelRef.current = m
        setLoading(false)
      } catch {
        setError('Detection model failed to load.')
        setLoading(false)
      }
    }
    load()
  }, [])

  // Detection loop
  useEffect(() => {
    if (!ready || loading) return
    let tick = 0
    const tracked = new Map<string, DetectedPerson>()

    async function loop() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) { frameRef.current = requestAnimationFrame(loop); return }
      const ctx = canvas.getContext('2d')!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      tick++

      if (modelRef.current && tick % 6 === 0) {
        try {
          const preds = await modelRef.current.detect(video)
          const people = preds.filter((p: any) => p.class === 'person' && p.score > 0.4)
          const current = new Map<string, DetectedPerson>()

          for (const p of people) {
            const [x, y, w, h] = p.bbox
            const key = `${Math.round(x/20)},${Math.round(y/20)},${Math.round(w/20)},${Math.round(h/20)}`
            const existing = tracked.get(key)
            if (existing) {
              existing.stableFrames++
              existing.score = p.score
              current.set(key, existing)
            } else {
              current.set(key, { id: `p-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, bbox: p.bbox, score: p.score, stableFrames: 1 })
            }
          }

          // Trigger capture when person is stable for required frames
          for (const [, person] of current) {
            if (person.stableFrames >= stableRequired && !capturedRef.current.has(person.id) && !confirming) {
              capturedRef.current.add(person.id)
              // Take the snapshot
              const [x, y, w, h] = person.bbox
              const pad = 0.2
              const px = Math.max(0, x - w * pad)
              const py = Math.max(0, y - h * pad * 2) // extra top padding for full body
              const pw = Math.min(video.videoWidth - px, w * (1 + pad * 2))
              const ph = Math.min(video.videoHeight - py, h * (1 + pad * 3))
              const cc = document.createElement('canvas'); cc.width = pw; cc.height = ph
              cc.getContext('2d')!.drawImage(video, px, py, pw, ph, 0, 0, pw, ph)
              setCapturedImage(cc.toDataURL('image/jpeg', 0.9))
              setConfirming(true)
              setVerifyResult(null)
              break
            }
          }

          tracked.clear(); for (const [k, v] of current) tracked.set(k, v)
          setDetected(Array.from(current.values()))
        } catch {}
      }

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of detected) {
        const [x, y, w, h] = p.bbox
        const stable = Math.min(p.stableFrames / stableRequired, 1)
        ctx.strokeStyle = stable >= 1 ? '#2563eb' : `rgba(37,99,235,${0.4 + stable * 0.6})`
        ctx.lineWidth = stable >= 1 ? 3 : 2
        ctx.shadowColor = 'rgba(37,99,235,0.3)'; ctx.shadowBlur = stable >= 1 ? 12 : 6
        const r = 12
        ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r)
        ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h)
        ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
        ctx.stroke()
        ctx.shadowBlur = 0
        // Label
        ctx.fillStyle = stable >= 1 ? '#2563eb' : 'rgba(37,99,235,0.7)'
        ctx.font = '12px system-ui'; ctx.textAlign = 'center'
        ctx.fillText(`${Math.round(p.score*100)}% · ${p.stableFrames}f`, x + w/2, y - 8)
      }

      frameRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(frameRef.current)
  }, [ready, loading, detected, confirming])

  // Verify with VL model
  const handleVerify = useCallback(async () => {
    if (!capturedImage) return
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await fetch('/api/verify-person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage }),
      })
      const data = await res.json()
      if (data.error) {
        setVerifyResult(`API error: ${data.error}`)
      } else if (data.isPerson && data.fullBody) {
        setVerifyResult('confirmed')
      } else if (data.isPerson) {
        setVerifyResult('partial')
      } else {
        setVerifyResult('no_person')
      }
    } catch (e: any) {
      setVerifyResult(`Network error: ${e.message}`)
    }
    setVerifying(false)
  }, [capturedImage])

  // Save to collection
  const handleCollect = useCallback(async () => {
    if (!capturedImage) return
    setSaving(true)
    setFlash(true); setTimeout(() => setFlash(false), 150)
    const thumb = document.createElement('canvas'); thumb.width = 200; thumb.height = 200
    const img = new Image()
    await new Promise<void>(r => { img.onload = () => {
      const s = Math.min(img.width, img.height); const sx = (img.width-s)/2; const sy = (img.height-s)/2
      thumb.getContext('2d')!.drawImage(img, sx, sy, s, s, 0, 0, 200, 200); r()
    }; img.src = capturedImage })
    try {
      await capturePerson(capturedImage, thumb.toDataURL('image/jpeg', 0.7))
      setCapturedCount(c => c + 1)
    } catch {}
    setSaving(false); setConfirming(false); setCapturedImage(null); setVerifyResult(null)
  }, [capturedImage, capturePerson])

  const handleDismiss = () => { setConfirming(false); setCapturedImage(null); setVerifyResult(null) }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <AnimatePresence>
        {loading && (
          <motion.div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#faf9f7]" exit={{ opacity: 0 }}>
            <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin mb-3" />
            <p className="text-sm text-[#737373]">Loading camera & detection model...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#faf9f7] p-8 text-center">
          <AlertCircle className="w-10 h-10 text-[#dc2626] mb-3" />
          <p className="text-sm text-[#737373]">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 rounded-xl bg-[#1a1a1a] text-white text-sm font-medium">Retry</button>
        </div>
      )}

      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <AnimatePresence>
        {flash && <motion.div className="absolute inset-0 z-10 bg-white" initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} />}
      </AnimatePresence>

      {/* Status */}
      <div className="absolute top-4 inset-x-4 z-10 flex justify-between items-start">
        <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs text-[#1a1a1a] font-medium flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-[#f59e0b]' : 'bg-[#16a34a]'} ${!loading && 'animate-pulse'}`} />
          {loading ? 'Loading' : 'Scanning'}
        </div>
        {capturedCount > 0 && (
          <motion.div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-xs text-[#1a1a1a] font-medium" initial={{ scale: 0 }} animate={{ scale: 1 }}>
            +{capturedCount}
          </motion.div>
        )}
      </div>

      {/* Empty guide */}
      {detected.length === 0 && ready && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Camera className="w-10 h-10 text-white/25 mx-auto mb-3" />
            <p className="text-white/50 text-sm font-medium">Point camera at a person</p>
            <p className="text-white/25 text-xs mt-1">Hold still — captures automatically</p>
          </div>
        </div>
      )}

      {/* Confirm dialog with VL verification */}
      <AnimatePresence>
        {confirming && capturedImage && (
          <motion.div className="absolute inset-0 z-30 flex items-end justify-center pb-32" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={handleDismiss} />
            <motion.div
              className="relative w-[92vw] max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="aspect-[4/5] bg-[#f5f4f1] relative">
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                <div className="absolute inset-0 ring-2 ring-[#2563eb] ring-inset rounded-t-2xl" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-[#1a1a1a]">Person captured</h3>
                <p className="text-xs text-[#737373] mt-0.5">Verify with AI before adding to collection</p>

                {/* Verify button or result */}
                {!verifyResult && (
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="mt-3 w-full py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1d4ed8] transition-colors disabled:opacity-60"
                  >
                    {verifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying with AI...</> : <><Shirt className="w-4 h-4" /> Verify Full Body</>}
                  </button>
                )}

                {/* Verification results */}
                {verifyResult === 'confirmed' && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-[#16a34a] mb-3">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-semibold">Full body person confirmed</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleDismiss} className="flex-1 py-2.5 rounded-xl border border-[#e6e4e0] text-sm font-medium text-[#737373] hover:bg-[#f5f4f1]">Dismiss</button>
                      <button onClick={handleCollect} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-sm font-semibold hover:bg-[#404040] disabled:opacity-50 flex items-center justify-center gap-1.5">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Add to Collection
                      </button>
                    </div>
                  </div>
                )}

                {verifyResult === 'partial' && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-[#f59e0b] mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Partial body only. Full body needed.</span>
                    </div>
                    <button onClick={handleDismiss} className="w-full py-2.5 rounded-xl border border-[#e6e4e0] text-sm font-medium text-[#737373] hover:bg-[#f5f4f1]">Dismiss</button>
                  </div>
                )}

                {verifyResult === 'no_person' && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-[#dc2626] mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">No person detected in frame</span>
                    </div>
                    <button onClick={handleDismiss} className="w-full py-2.5 rounded-xl border border-[#e6e4e0] text-sm font-medium text-[#737373] hover:bg-[#f5f4f1]">Dismiss</button>
                  </div>
                )}

                {verifyResult?.startsWith('API error') && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-[#dc2626] mb-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">{verifyResult}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleDismiss} className="flex-1 py-2.5 rounded-xl border border-[#e6e4e0] text-sm">Dismiss</button>
                      <button onClick={handleVerify} className="flex-1 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-semibold">Retry</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <div className="absolute bottom-6 inset-x-0 z-10 flex justify-center">
        <div className="px-4 py-2 rounded-full bg-white/90 backdrop-blur text-xs text-[#737373] font-medium">
          {detected.length} detected · hold still
        </div>
      </div>
    </div>
  )
}
