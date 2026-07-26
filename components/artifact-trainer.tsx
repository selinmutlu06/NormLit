"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, XCircle, RotateCcw, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ArtifactId = "clean" | "eye-blink" | "emg" | "movement" | "line-noise" | "pop"

interface Artifact {
  id: ArtifactId
  label: string
  blurb: string
}

const ARTIFACTS: Artifact[] = [
  {
    id: "clean",
    label: "Clean EEG",
    blurb:
      "Low-amplitude, irregular activity with no dominant artifact. This trace is usable — not everything is a problem.",
  },
  {
    id: "eye-blink",
    label: "Eye blink",
    blurb:
      "A large, slow deflection lasting roughly 200-400 ms, strongest at frontal electrodes and on the VEOG channel.",
  },
  {
    id: "emg",
    label: "Muscle (EMG)",
    blurb:
      "Bursts of high-frequency (>20 Hz) activity from jaw, neck, or forehead tension. Ask the participant to relax.",
  },
  {
    id: "movement",
    label: "Movement / drift",
    blurb:
      "Slow, large baseline wander from head or body motion, or from gel drying out. Re-check the electrode if it persists.",
  },
  {
    id: "line-noise",
    label: "60 Hz line noise",
    blurb:
      "A constant, regular sinusoid at mains frequency from nearby power sources. Check grounding and move cables away from power.",
  },
  {
    id: "pop",
    label: "Electrode pop",
    blurb:
      "A sudden step or spike from an unstable electrode momentarily losing contact. Re-gel or reseat that electrode.",
  },
]

const BY_ID: Record<ArtifactId, Artifact> = Object.fromEntries(
  ARTIFACTS.map((a) => [a.id, a]),
) as Record<ArtifactId, Artifact>

/** Small, fast seeded PRNG so each question's trace is stable across re-renders. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const N = 150

/** Build a normalized (~[-1,1]) waveform for one artifact type. */
function seriesFor(id: ArtifactId, rng: () => number): number[] {
  const p1 = rng() * Math.PI * 2
  const p2 = rng() * Math.PI * 2
  const blinkCenter = 0.28 + rng() * 0.28
  const popAt = Math.floor((0.35 + rng() * 0.3) * N)
  const popLevel = 0.22 + rng() * 0.16
  const out: number[] = []
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    let y = 0
    switch (id) {
      case "clean":
        y =
          0.16 * Math.sin(2 * Math.PI * 3 * t + p1) +
          0.1 * Math.sin(2 * Math.PI * 6.5 * t + p2) +
          0.07 * (rng() - 0.5)
        break
      case "eye-blink":
        y = 0.92 * Math.exp(-Math.pow(t - blinkCenter, 2) / (2 * 0.05 * 0.05)) + 0.04 * (rng() - 0.5)
        break
      case "emg":
        y = (rng() * 2 - 1) * 0.5 * (0.55 + 0.45 * Math.sin(2 * Math.PI * 1.5 * t))
        break
      case "movement":
        y = 0.62 * Math.sin(2 * Math.PI * 0.75 * t + p1) + 0.05 * (rng() - 0.5)
        break
      case "line-noise":
        y = 0.38 * Math.sin(2 * Math.PI * 24 * t) + 0.03 * (rng() - 0.5)
        break
      case "pop":
        if (i < popAt) y = 0.03 * (rng() - 0.5)
        else if (i < popAt + 2) y = 0.92
        else y = popLevel + 0.03 * (rng() - 0.5)
        break
    }
    out.push(y)
  }
  return out
}

function toPolyline(series: number[]): string {
  return series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * 300
      const clamped = Math.max(-1.2, Math.min(1.2, v))
      const y = 45 - clamped * 32
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function ArtifactTrainer() {
  // null until the user starts; keeps the server render deterministic (no hydration mismatch).
  const [seed, setSeed] = useState<number | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [answered, setAnswered] = useState<ArtifactId | null>(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const question = useMemo(() => {
    if (seed === null) return null
    // Cover every artifact type in a shuffled cycle before repeating.
    const order = shuffle(ARTIFACTS, mulberry32(seed))
    const correct = order[qIndex % order.length]
    const rng = mulberry32((seed ^ (qIndex * 0x9e3779b1)) >>> 0)
    const points = toPolyline(seriesFor(correct.id, rng))
    const distractors = shuffle(
      ARTIFACTS.filter((a) => a.id !== correct.id),
      rng,
    ).slice(0, 3)
    const options = shuffle([correct, ...distractors], rng)
    return { correct, points, options }
  }, [seed, qIndex])

  function start() {
    setSeed((Math.floor(Math.random() * 1e9) + 1) >>> 0)
    setQIndex(0)
    setAnswered(null)
    setScore(0)
    setTotal(0)
  }

  function choose(id: ArtifactId) {
    if (answered || !question) return
    setAnswered(id)
    setTotal((t) => t + 1)
    if (id === question.correct.id) setScore((s) => s + 1)
  }

  function next() {
    setQIndex((i) => i + 1)
    setAnswered(null)
  }

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0

  if (!question) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-6 text-center">
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Recognizing artifacts by eye is the skill that takes new lab members months. Each round
          shows a one-second trace — decide what it is before it contaminates your data.
        </p>
        <Button onClick={start} className="mt-4 gap-2">
          <Play className="size-4" />
          Start drill
        </Button>
      </div>
    )
  }

  const isCorrect = answered === question.correct.id

  return (
    <div className="space-y-5">
      {/* Score bar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Question <span className="font-mono font-medium text-foreground">{total + (answered ? 0 : 1)}</span>
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {score}/{total} correct
          </Badge>
          {total > 0 && (
            <Badge variant="outline" className="font-mono">
              {accuracy}%
            </Badge>
          )}
        </div>
      </div>

      {/* Waveform — neutral color so it never hints at the answer */}
      <div className="rounded-xl border border-border bg-background p-4">
        <svg viewBox="0 0 300 90" className="h-28 w-full text-foreground" preserveAspectRatio="none">
          <line x1="0" y1="45" x2="300" y2="45" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
          <polyline
            points={question.points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Options */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {question.options.map((opt) => {
          const chosen = answered === opt.id
          const showCorrect = answered !== null && opt.id === question.correct.id
          const showWrong = chosen && !isCorrect
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => choose(opt.id)}
              disabled={answered !== null}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                answered === null && "hover:border-accent/50 hover:bg-muted/50",
                showCorrect && "border-green-500/50 bg-green-500/10",
                showWrong && "border-red-500/50 bg-red-500/10",
                !showCorrect && !showWrong && "border-border",
              )}
            >
              <span className="font-medium">{opt.label}</span>
              {showCorrect && <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" />}
              {showWrong && <XCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {answered !== null && (
        <div
          className={cn(
            "rounded-lg border p-4 text-sm",
            isCorrect ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5",
          )}
        >
          <p className="font-medium">
            {isCorrect ? "Correct — " : "Not quite — this is "}
            {question.correct.label}
          </p>
          <p className="mt-1 text-muted-foreground">{BY_ID[question.correct.id].blurb}</p>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={next} size="sm">
              Next trace
            </Button>
            <Button onClick={start} size="sm" variant="ghost" className="gap-1.5">
              <RotateCcw className="size-3.5" />
              Restart
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
