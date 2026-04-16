import { cn } from '@/shared/lib/utils'

type WavePixelControlsProps = {
  value: number
  onChange: (next: number) => void
  label: string
  min?: number
  max?: number
}

export function WavePixelControls({
  value,
  onChange,
  label,
  min = 1,
  max = 8,
}: WavePixelControlsProps) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white',
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45">
          {label}
        </span>
        <span className="font-mono text-lg font-semibold tabular-nums text-cyan-300">
          {value}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
          onClick={dec}
          aria-label="Decrease"
        >
          -
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
          onClick={inc}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  )
}
