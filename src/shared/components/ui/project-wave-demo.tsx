import { DitheringShader } from '@/shared/components/ui/dithering-shader'

type ProjectWaveDemoProps = {
  pxSize?: number
  waveLabel?: string
}

export function ProjectWaveDemo({
  pxSize = 3,
  waveLabel = 'Wave',
}: ProjectWaveDemoProps) {
  return (
    <div className="relative flex h-full min-h-[320px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#020817] shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <DitheringShader
        className="absolute inset-0 h-full w-full opacity-90"
        style={{ width: '100%', height: '100%' }}
        shape="wave"
        type="8x8"
        colorBack="#020817"
        colorFront="#22d3ee"
        pxSize={pxSize}
        speed={0.6}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <span className="pointer-events-none z-10 px-6 text-center text-5xl font-semibold leading-none tracking-tighter whitespace-pre-wrap text-white md:text-7xl">
        {waveLabel}
      </span>
    </div>
  )
}
