import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ShaderPlane } from '@/shared/components/ui/background-paper-shaders'
import { hasWebGL } from '@/shared/lib/webgl'

export function Background() {
  const webglOk = useMemo(() => hasWebGL(), [])
  const [enableBackground, setEnableBackground] = useState(false)

  useEffect(() => {
    if (!webglOk) return
    if (typeof window === 'undefined') return

    const enable = () => setEnableBackground(true)

    const timeoutId = window.setTimeout(enable, 1500)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [webglOk])

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Base Dark Gradient */}
      <div className="absolute inset-0 bg-[#020205]" />

      {/* Shader Layer */}
      {webglOk && enableBackground ? (
        <div className="absolute inset-0 opacity-20">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <ShaderPlane position={[0, 0, 0]} color1="#6366f1" color2="#06b6d4" />
          </Canvas>
        </div>
      ) : null}

      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_70%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
