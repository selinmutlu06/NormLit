"use client"

import { useEffect, useRef, useMemo } from "react"
import { cn } from "@/lib/utils"

interface EEGWaveformProps {
  className?: string
  channels?: number
  animated?: boolean
  compact?: boolean
  labels?: string[]
}

// Generate realistic EEG-like waveform data
function generateWaveformData(length: number, complexity: number = 3): number[] {
  const data: number[] = []
  const frequencies = [
    { freq: 0.5, amp: 0.3 },   // Delta-like (slow)
    { freq: 2, amp: 0.25 },    // Theta-like
    { freq: 4, amp: 0.2 },     // Alpha-like
    { freq: 8, amp: 0.15 },    // Beta-like
    { freq: 12, amp: 0.1 },    // Gamma-like (fast)
  ].slice(0, complexity + 2)

  for (let i = 0; i < length; i++) {
    let value = 0
    frequencies.forEach(({ freq, amp }) => {
      value += Math.sin((i / length) * Math.PI * 2 * freq * 10) * amp
    })
    // Deterministic, seeded noise for realism. Stable across SSR and client so
    // the rendered path matches and React doesn't flag a hydration mismatch.
    const seeded = Math.sin(i * 12.9898 + 78.233) * 43758.5453
    const noise = seeded - Math.floor(seeded)
    value += (noise - 0.5) * 0.1
    data.push(value)
  }
  return data
}

function WaveformPath({ 
  data, 
  width, 
  height, 
  color,
  strokeWidth = 1.5
}: { 
  data: number[]
  width: number
  height: number
  color: string
  strokeWidth?: number
}) {
  const pathD = useMemo(() => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height / 2 - value * (height / 2.5)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    return points.join(' ')
  }, [data, width, height])

  return (
    <path
      d={pathD}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

export function EEGWaveform({ 
  className, 
  channels = 4, 
  animated = true,
  compact = false,
  labels = ["Fz", "Cz", "Pz", "Oz"]
}: EEGWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const channelHeight = compact ? 32 : 48
  const totalHeight = channelHeight * channels
  
  const waveforms = useMemo(() => {
    return Array.from({ length: channels }, (_, i) => 
      generateWaveformData(200, i % 4)
    )
  }, [channels])

  const colors = [
    "var(--eeg-alpha)",
    "var(--eeg-beta)", 
    "var(--eeg-theta)",
    "var(--eeg-delta)"
  ]

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-card",
        className
      )}
    >
      {/* Time scale header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">EEG Signal</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">10 uV/div</span>
          <span className="font-mono text-xs text-muted-foreground">1 sec</span>
        </div>
      </div>

      {/* Waveform channels */}
      <div className="relative" style={{ height: totalHeight }}>
        {/* Grid lines */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-30"
          preserveAspectRatio="none"
        >
          {Array.from({ length: channels + 1 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * channelHeight}
              x2="100%"
              y2={i * channelHeight}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
            />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={`${i * 10}%`}
              y1="0"
              x2={`${i * 10}%`}
              y2="100%"
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
              strokeDasharray={i % 5 === 0 ? "none" : "2,2"}
            />
          ))}
        </svg>

        {/* Channel labels */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col border-r border-border bg-card/80 backdrop-blur-sm z-10">
          {labels.slice(0, channels).map((label, i) => (
            <div 
              key={label}
              className="flex items-center justify-center font-mono text-xs font-medium"
              style={{ height: channelHeight, color: colors[i % colors.length] }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Waveforms */}
        <div className={cn("ml-10 overflow-hidden", animated && "animate-eeg")} style={{ width: animated ? "200%" : "100%" }}>
          <svg 
            width="100%" 
            height={totalHeight}
            preserveAspectRatio="none"
            viewBox={`0 0 800 ${totalHeight}`}
          >
            {waveforms.map((data, i) => (
              <g key={i} transform={`translate(0, ${i * channelHeight})`}>
                <WaveformPath
                  data={data}
                  width={animated ? 800 : 400}
                  height={channelHeight}
                  color={colors[i % colors.length]}
                  strokeWidth={compact ? 1 : 1.5}
                />
                {animated && (
                  <WaveformPath
                    data={data}
                    width={400}
                    height={channelHeight}
                    color={colors[i % colors.length]}
                    strokeWidth={compact ? 1 : 1.5}
                  />
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-border bg-muted/50 px-3 py-1">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-chart-1 animate-pulse" />
          <span className="font-mono text-xs text-muted-foreground">Live</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">256 Hz</span>
      </div>
    </div>
  )
}

// Compact inline waveform for cards
export function InlineWaveform({ 
  className,
  color = "var(--eeg-alpha)"
}: { 
  className?: string
  color?: string
}) {
  const data = useMemo(() => generateWaveformData(50, 2), [])
  
  return (
    <svg 
      className={cn("w-full h-6", className)}
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
    >
      <WaveformPath
        data={data}
        width={100}
        height={24}
        color={color}
        strokeWidth={1}
      />
    </svg>
  )
}

// Brain topographic map placeholder
export function BrainTopoMap({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Head outline */}
        <ellipse 
          cx="50" cy="50" rx="45" ry="48" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
          className="text-border"
        />
        {/* Nose indicator */}
        <path 
          d="M 50 2 L 54 10 L 46 10 Z" 
          fill="currentColor" 
          className="text-border"
        />
        {/* Electrode positions */}
        {[
          { x: 50, y: 20, label: "Fz", color: "var(--eeg-alpha)" },
          { x: 50, y: 50, label: "Cz", color: "var(--eeg-beta)" },
          { x: 50, y: 80, label: "Pz", color: "var(--eeg-theta)" },
          { x: 20, y: 50, label: "C3", color: "var(--eeg-delta)" },
          { x: 80, y: 50, label: "C4", color: "var(--eeg-alpha)" },
          { x: 30, y: 30, label: "F3", color: "var(--eeg-beta)" },
          { x: 70, y: 30, label: "F4", color: "var(--eeg-theta)" },
          { x: 30, y: 70, label: "P3", color: "var(--eeg-delta)" },
          { x: 70, y: 70, label: "P4", color: "var(--eeg-alpha)" },
        ].map(({ x, y, label, color }) => (
          <g key={label}>
            <circle 
              cx={x} cy={y} r="6" 
              fill={color}
              opacity="0.8"
            />
            <text 
              x={x} y={y + 1} 
              textAnchor="middle" 
              dominantBaseline="middle"
              className="fill-background text-[6px] font-mono font-bold"
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
