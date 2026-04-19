import { Suspense, lazy, useMemo } from 'react'
import { hasWebGL } from '@/shared/lib/webgl'

const Spline = lazy(() => {
  const original = console.warn
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : ''
    if (msg.includes('Multiple instances of Three.js') || msg.includes('updating from')) return
    original(...args)
  }
  return import('@splinetool/react-spline').finally(() => {
    console.warn = original
  })
})

interface SplineSceneProps {
  scene: string
  className?: string
  shouldLoad?: boolean
  onLoad?: () => void
}

export function SplineScene({ scene, className, shouldLoad = true, onLoad }: SplineSceneProps) {
  const webglOk = useMemo(() => hasWebGL(), [])

  if (!webglOk || !shouldLoad) {
    return (
      <div
        className={`w-full h-full min-h-[12rem] rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent ${className ?? ''}`}
        aria-hidden
      />
    )
  }

  return (
    <Suspense
      fallback={
        <div
          className={`w-full h-full min-h-[22rem] rounded-2xl bg-[#020205] bg-gradient-to-b from-white/[0.04] to-transparent ${className ?? ''}`}
          aria-hidden
        />
      }
    >
      <Spline scene={scene} className={className} onLoad={onLoad} />
    </Suspense>
  )
}
