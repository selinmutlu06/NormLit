"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, XCircle, Trophy, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LANDMARKS, LANDMARK_VIEW, type Landmark } from "@/lib/landmarks"

type Mode = "tap" | "identify"
interface Question {
  mode: Mode
  targetId: string
  options: Landmark[] // used by "identify"
}

const LESSON_LENGTH = 7
const byId = (id: string) => LANDMARKS.find((l) => l.id === id)!

/** Seeded PRNG so a lesson is stable across re-renders (built only after the user starts). */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildLesson(seed: number): Question[] {
  const rng = mulberry32(seed)
  // Cover every landmark once, then top up to LESSON_LENGTH with random extras.
  const targets = shuffle(LANDMARKS, rng).map((l) => l.id)
  while (targets.length < LESSON_LENGTH) {
    targets.push(LANDMARKS[Math.floor(rng() * LANDMARKS.length)].id)
  }
  return targets.slice(0, LESSON_LENGTH).map((targetId, i) => {
    const mode: Mode = (i + (seed % 2)) % 2 === 0 ? "tap" : "identify"
    const distractors = shuffle(
      LANDMARKS.filter((l) => l.id !== targetId),
      rng,
    ).slice(0, 3)
    const options = shuffle([byId(targetId), ...distractors], rng)
    return { mode, targetId, options }
  })
}

function HeadBase() {
  const { cx, cy, r } = LANDMARK_VIEW
  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="color-mix(in oklch, var(--muted) 55%, transparent)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <path
        d="M108 41 L120 20 L132 41 Z"
        fill="color-mix(in oklch, var(--muted) 55%, transparent)"
        stroke="var(--border)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M32 116 q-10 11 0 22" fill="none" stroke="var(--border)" strokeWidth="2" />
      <path d="M208 116 q10 11 0 22" fill="none" stroke="var(--border)" strokeWidth="2" />
      <line x1="120" y1="39" x2="120" y2="215" stroke="var(--foreground)" strokeWidth="1.25" strokeDasharray="4 4" opacity="0.25" />
      <line x1="32" y1="127" x2="208" y2="127" stroke="var(--foreground)" strokeWidth="1.25" strokeDasharray="4 4" opacity="0.25" />
    </>
  )
}

export function LandmarkLesson() {
  const [seed, setSeed] = useState<number | null>(null)
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  const questions = useMemo(() => (seed === null ? null : buildLesson(seed)), [seed])

  function start() {
    setSeed((Math.floor(Math.random() * 1e9) + 1) >>> 0)
    setIdx(0)
    setSelected(null)
    setCorrectCount(0)
    setDone(false)
  }

  function answer(id: string) {
    if (selected || !questions) return
    setSelected(id)
    if (id === questions[idx].targetId) setCorrectCount((c) => c + 1)
  }

  function next() {
    if (!questions) return
    if (idx + 1 >= questions.length) {
      setDone(true)
    } else {
      setIdx((i) => i + 1)
      setSelected(null)
      setHovered(null)
    }
  }

  // Intro
  if (!questions) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-6 text-center">
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          A quick drill on the four landmarks that anchor the cap. Tap the right spot on the head,
          or name the highlighted point. {LESSON_LENGTH} questions.
        </p>
        <Button onClick={start} className="mt-4 gap-2">
          <Play className="size-4" />
          Start lesson
        </Button>
      </div>
    )
  }

  // Completion
  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-8 text-center">
        <Trophy className="mx-auto size-10 text-accent" />
        <p className="mt-3 text-lg font-semibold">Lesson complete</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You got <span className="font-mono font-medium text-foreground">{correctCount}</span> of{" "}
          {questions.length} right ({pct}%).
        </p>
        <Button onClick={start} className="mt-4 gap-2" variant="outline">
          <RotateCcw className="size-4" />
          Practice again
        </Button>
      </div>
    )
  }

  const q = questions[idx]
  const target = byId(q.targetId)
  const answered = selected !== null
  const isCorrect = selected === q.targetId
  const progress = ((idx + (answered ? 1 : 0)) / questions.length) * 100

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {idx + 1}/{questions.length}
        </span>
      </div>

      {/* Prompt */}
      <p className="text-center text-base font-medium">
        {q.mode === "tap" ? (
          <>
            Tap the <span className="text-accent">{target.label}</span>
          </>
        ) : (
          "Which landmark is highlighted?"
        )}
      </p>

      {/* Head */}
      <div className="flex justify-center rounded-xl border border-border bg-background p-4">
        <svg
          viewBox={`0 0 ${LANDMARK_VIEW.w} ${LANDMARK_VIEW.h}`}
          className="h-auto w-full max-w-xs"
          role="img"
          aria-label="Top-down head diagram"
        >
          <HeadBase />
          {LANDMARKS.map((l) => {
            const isTarget = l.id === q.targetId
            const isPicked = l.id === selected

            if (q.mode === "identify") {
              // Highlight the target; others sit faint. Dots are not clickable here.
              return (
                <g key={l.id}>
                  {isTarget && !answered && (
                    <circle cx={l.cx} cy={l.cy} r="12" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="animate-pulse" />
                  )}
                  <circle
                    cx={l.cx}
                    cy={l.cy}
                    r={isTarget ? 7.5 : 5}
                    fill={isTarget ? "var(--accent)" : "var(--muted-foreground)"}
                    opacity={isTarget ? 1 : 0.4}
                    stroke="var(--background)"
                    strokeWidth="1.5"
                  />
                </g>
              )
            }

            // tap mode
            let fill = hovered === l.id ? "var(--accent)" : "var(--muted-foreground)"
            if (answered) {
              if (isTarget) fill = "var(--color-green-500, #22c55e)"
              else if (isPicked) fill = "var(--color-red-500, #ef4444)"
              else fill = "var(--muted-foreground)"
            }
            return (
              <g
                key={l.id}
                className={answered ? "" : "cursor-pointer"}
                onClick={() => answer(l.id)}
                onMouseEnter={() => !answered && setHovered(l.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Generous invisible hit area */}
                <circle cx={l.cx} cy={l.cy} r="18" fill="transparent" />
                <circle
                  cx={l.cx}
                  cy={l.cy}
                  r={hovered === l.id && !answered ? 9 : 7}
                  fill={fill}
                  opacity={answered && !isTarget && !isPicked ? 0.35 : 1}
                  stroke="var(--background)"
                  strokeWidth="1.5"
                  className="transition-all"
                />
                {answered && isTarget && (
                  <path d={`M${l.cx - 3} ${l.cy} l2 2 l4 -4`} fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Identify options */}
      {q.mode === "identify" && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {q.options.map((opt) => {
            const showCorrect = answered && opt.id === q.targetId
            const showWrong = answered && opt.id === selected && !isCorrect
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => answer(opt.id)}
                disabled={answered}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                  !answered && "hover:border-accent/50 hover:bg-muted/50",
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
      )}

      {/* Feedback */}
      {answered && (
        <div
          className={cn(
            "rounded-lg border p-4 text-sm",
            isCorrect ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5",
          )}
        >
          <p className="font-medium">
            {isCorrect ? "Correct — " : "Not quite — that's the "}
            {target.label}
          </p>
          <p className="mt-1 text-muted-foreground">{target.hint}</p>
          <Button onClick={next} size="sm" className="mt-3">
            {idx + 1 >= questions.length ? "Finish" : "Continue"}
          </Button>
        </div>
      )}
    </div>
  )
}
