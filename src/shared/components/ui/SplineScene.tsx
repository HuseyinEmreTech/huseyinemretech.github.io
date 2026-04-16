import { Suspense, lazy, useMemo } from 'react'
import { hasWebGL } from '@/shared/lib/webgl'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const webglOk = useMemo(() => hasWebGL(), [])

  if (!webglOk) {
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
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  )
}
