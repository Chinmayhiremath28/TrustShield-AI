import React, { useEffect, useRef } from 'react'

// ── Premium ambient canvas — warm dust particles, no neon ────
export default function ParticleBackground() {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')

    let W = window.innerWidth
    let H = window.innerHeight
    const isMobile = W < 768

    // Only render on desktop
    if (isMobile) return

    canvas.width  = W
    canvas.height = H

    const COUNT = 22
    const particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .08,
      vy: (Math.random() - .5) * .08,
      r:  .6 + Math.random() * 1.2,
      life: Math.random(),
    }))

    function draw() {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        // Warm cream/gold tone — very muted
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232,200,150, ${.08 + p.life * .07})`
        ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        p.life = (p.life + .001) % 1
      })
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight
      canvas.width = W; canvas.height = H
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:.5,
    }}/>
  )
}
