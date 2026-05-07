import { Component, Suspense, lazy, useMemo } from 'react'
import { hasWebGL } from '@/shared/lib/webgl'

const FILTERED_WARNS = ['Multiple instances of Three.js', 'updating from']

const Spline = lazy(async () => {
  const originalWarn = console.warn
  console.warn = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : ''
    if (FILTERED_WARNS.some((pattern) => msg.includes(pattern))) return
    originalWarn(...args)
  }
  try {
    return await import('@splinetool/react-spline')
  } finally {
    console.warn = originalWarn
  }
})

interface SplineSceneProps {
  scene: string
  className?: string
  shouldLoad?: boolean
  onLoad?: () => void
  onError?: () => void
}

interface EBState { hasError: boolean }

class SplineErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: () => void },
  EBState
> {
  state: EBState = { hasError: false }
  static getDerivedStateFromError(): EBState { return { hasError: true } }
  componentDidCatch() { this.props.onError?.() }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function RobotFallback({ className }: { className?: string }) {
  return (
    <div
      className={`w-full h-full min-h-[12rem] rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent flex items-center justify-center ${className ?? ''}`}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="w-20 h-20 opacity-[0.07]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="35" width="50" height="40" rx="8" stroke="white" strokeWidth="3"/>
        <circle cx="38" cy="52" r="6" fill="white"/>
        <circle cx="62" cy="52" r="6" fill="white"/>
        <rect x="42" y="62" width="16" height="4" rx="2" fill="white"/>
        <rect x="46" y="20" width="8" height="15" rx="4" stroke="white" strokeWidth="3"/>
        <rect x="8" y="45" width="14" height="6" rx="3" stroke="white" strokeWidth="2.5"/>
        <rect x="78" y="45" width="14" height="6" rx="3" stroke="white" strokeWidth="2.5"/>
      </svg>
    </div>
  )
}

export function SplineScene({ scene, className, shouldLoad = true, onLoad, onError }: SplineSceneProps) {
  const webglOk = useMemo(() => hasWebGL(), [])

  if (!webglOk || !shouldLoad) {
    return <RobotFallback className={className} />
  }

  return (
    <SplineErrorBoundary fallback={<RobotFallback className={className} />} onError={onError}>
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
    </SplineErrorBoundary>
  )
}
