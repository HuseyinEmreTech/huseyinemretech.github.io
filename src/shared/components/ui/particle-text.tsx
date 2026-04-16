import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'

interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
}

interface ParticleTextProps {
  text: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  color?: string
  particleSize?: number
  density?: number
  speed?: number
  dispersion?: number
  mouseRadius?: number
  className?: string
  width?: number
  height?: number
}

export default function ParticleText({
  text = 'Hello',
  fontSize = 120,
  fontFamily = 'sans-serif',
  fontWeight = '700',
  color = '#ffffff',
  particleSize = 2,
  density = 4,
  speed = 0.08,
  dispersion = 80,
  mouseRadius = 80,
  className,
  width = 600,
  height = 200,
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef<number>(0)
  const [isVisible, setIsVisible] = useState(false)

  // Intersection Observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.1,
    })
    if (canvasRef.current) observer.observe(canvasRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    // Sample text pixels
    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = height
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return

    offCtx.fillStyle = color
    offCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
    offCtx.textAlign = 'center'
    offCtx.textBaseline = 'middle'
    offCtx.fillText(text, width / 2, height / 2)

    const imageData = offCtx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    const particles: Particle[] = []

    for (let y = 0; y < height; y += density) {
      for (let x = 0; x < width; x += density) {
        const idx = (y * width + x) * 4
        if (pixels[idx + 3] > 128) {
          // scatter from random position
          const angle = Math.random() * Math.PI * 2
          const dist = Math.random() * dispersion + 20
          particles.push({
            x: x + Math.cos(angle) * dist * (Math.random() < 0.5 ? 1 : -1),
            y: y + Math.sin(angle) * dist * (Math.random() < 0.5 ? 1 : -1),
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            size: particleSize * (0.6 + Math.random() * 0.8),
            color,
            alpha: 0.4 + Math.random() * 0.6,
          })
        }
      }
    }

    particlesRef.current = particles

    const draw = () => {
      if (!isVisible) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, width, height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const p of particlesRef.current) {
        // Attraction to origin
        const dx = p.originX - p.x
        const dy = p.originY - p.y
        p.vx += dx * speed
        p.vy += dy * speed

        // Mouse repulsion
        const mdx = p.x - mx
        const mdy = p.y - my
        const dist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius
          p.vx += (mdx / dist) * force * 6
          p.vy += (mdy / dist) * force * 6
        }

        p.vx *= 0.82
        p.vy *= 0.82
        p.x += p.vx
        p.y += p.vy

        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const scaleX = width / rect.width
      const scaleY = height / rect.height
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [
    text,
    fontSize,
    fontFamily,
    fontWeight,
    color,
    particleSize,
    density,
    speed,
    dispersion,
    mouseRadius,
    width,
    height,
    isVisible,
  ])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'block transition-opacity duration-1000',
        isVisible ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{ width, height }}
      aria-label={`Particle text rendering: ${text}`}
    />
  )
}
