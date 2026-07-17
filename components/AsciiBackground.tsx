'use client'

import { useEffect, useRef } from 'react'

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン▀▄▌▐░▒▓█'

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const fontSize = 14
    const cols = Math.floor(canvas.width / fontSize)
    const drops: number[] = Array(cols).fill(0)
    const speeds: number[] = Array(cols).fill(0).map(() => Math.random() * 0.3 + 0.1)

    const draw = () => {
      ctx.fillStyle = 'rgba(9, 9, 11, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px monospace`
      ctx.textAlign = 'center'

      for (let i = 0; i < drops.length; i++) {
        if (Math.random() > 0.97) {
          const char = CHARS[Math.floor(Math.random() * CHARS.length)]
          const x = i * fontSize
          const y = drops[i] * fontSize

          const alpha = 0.04 + Math.random() * 0.04
          ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`
          ctx.fillText(char, x, y)

          if (Math.random() > 0.95) {
            ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 2})`
            ctx.fillText(char, x, y)
          }
        }

        drops[i] += speeds[i]
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
          speeds[i] = Math.random() * 0.3 + 0.1
        }
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  )
}