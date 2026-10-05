import { cn } from "@/lib/utils"

/*
  Illustrative grand-average ERP (not real data): a norm-consistent and a
  norm-violating condition that diverge in the N400 window. Plotted with the
  EEG convention of negative voltage up.
*/

const W = 560
const H = 300
const PAD = { top: 24, right: 20, bottom: 40, left: 44 }
const T_MIN = -100
const T_MAX = 800
const V_RANGE = 7 // µV, symmetric

type Peak = { t: number; amp: number; width: number }

const BASE: Peak[] = [
  { t: 100, amp: -2.6, width: 28 }, // N1
  { t: 190, amp: 3.2, width: 38 }, // P2
  { t: 620, amp: 1.4, width: 110 }, // late positivity
]

function wave(peaks: Peak[], t: number) {
  if (t < 0) return 0
  return peaks.reduce((v, p) => v + p.amp * Math.exp(-((t - p.t) ** 2) / (2 * p.width ** 2)), 0)
}

const x = (t: number) => PAD.left + ((t - T_MIN) / (T_MAX - T_MIN)) * (W - PAD.left - PAD.right)
// Negative up: −V_RANGE maps to the top of the plot.
const y = (v: number) => PAD.top + ((v + V_RANGE) / (2 * V_RANGE)) * (H - PAD.top - PAD.bottom)

function path(peaks: Peak[]) {
  const pts: string[] = []
  for (let t = T_MIN; t <= T_MAX; t += 4) {
    pts.push(`${pts.length ? "L" : "M"}${x(t).toFixed(1)} ${y(wave(peaks, t)).toFixed(1)}`)
  }
  return pts.join(" ")
}

const CONSISTENT = path([...BASE, { t: 400, amp: -1.2, width: 70 }])
const VIOLATION = path([...BASE, { t: 400, amp: -4.8, width: 72 }])

export function ERPFigure({ className }: { className?: string }) {
  const zeroY = y(0)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Illustrative event-related potential at Cz showing a larger N400 for norm-violating sentences"
    >
      {/* N400 window */}
      <rect
        x={x(300)}
        y={PAD.top}
        width={x(500) - x(300)}
        height={H - PAD.top - PAD.bottom}
        className="fill-foreground/[0.05]"
      />
      <text x={(x(300) + x(500)) / 2} y={H - PAD.bottom - 8} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
        N400 window
      </text>

      {/* Axes */}
      <line x1={PAD.left} x2={W - PAD.right} y1={zeroY} y2={zeroY} className="stroke-foreground/40" strokeWidth={1} />
      <line x1={x(0)} x2={x(0)} y1={PAD.top} y2={H - PAD.bottom} className="stroke-foreground/40" strokeWidth={1} />
      {[0, 200, 400, 600, 800].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={zeroY} y2={zeroY + 4} className="stroke-foreground/40" />
          <text x={x(t)} y={H - PAD.bottom + 18} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
            {t}
          </text>
        </g>
      ))}
      <text x={W - PAD.right} y={H - 6} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
        ms
      </text>
      {[-5, 5].map((v) => (
        <g key={v}>
          <line x1={x(0) - 4} x2={x(0)} y1={y(v)} y2={y(v)} className="stroke-foreground/40" />
          <text x={x(0) - 8} y={y(v) + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
            {v > 0 ? `+${v}` : `−${-v}`}
          </text>
        </g>
      ))}
      <text x={PAD.left - 30} y={PAD.top + 4} className="fill-muted-foreground font-mono text-[10px]">
        µV
      </text>

      {/* Traces */}
      <path d={CONSISTENT} fill="none" className="stroke-foreground" strokeWidth={1.5} />
      <path d={VIOLATION} fill="none" className="stroke-accent" strokeWidth={1.75} />

      {/* Direct labels instead of a legend */}
      <text x={x(400)} y={y(-4.8) - 10} textAnchor="middle" className="fill-accent font-sans text-[11px]">
        norm-violating
      </text>
      <text x={x(400)} y={y(1.8)} textAnchor="middle" className="fill-foreground font-sans text-[11px]">
        norm-consistent
      </text>
      <text x={PAD.left + 4} y={H - PAD.bottom - 8} className="fill-muted-foreground font-mono text-[10px]">
        Cz
      </text>
    </svg>
  )
}
