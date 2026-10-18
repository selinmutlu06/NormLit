"use client"

import { useEffect, useRef } from "react"

/*
  Decorative raw-EEG strip drawn in text characters. The signal is simulated
  (alpha-ish rhythm + slow drift + noise, with a periodic blink on Fz), not
  recorded data.
*/

const CHANNELS = [
  { name: "Fz", amp: 1.0, hz: 9.5 },
  { name: "Cz", amp: 0.8, hz: 10.2 },
  { name: "Pz", amp: 1.2, hz: 10.8 },
]
const ROWS = 5
const MID = Math.floor(ROWS / 2)

function sample(k: number, t: number) {
  const { amp, hz } = CHANNELS[k]
  let v = amp * (0.55 * Math.sin(t * hz * 0.6) + 0.25 * Math.sin(t * 2.3 + k) + 0.2 * (Math.random() * 2 - 1))
  const blink = t % 9
  if (k === 0 && blink < 0.35) v -= 2.2 * Math.sin((blink / 0.35) * Math.PI)
  return v
}

export function AsciiEEG() {
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const pre = preRef.current
    if (!pre) return

    let cols = 80
    let t = 0
    const buffers: number[][] = CHANNELS.map(() => [])

    const measure = () => {
      const probe = document.createElement("span")
      probe.textContent = "MMMMMMMMMM"
      pre.appendChild(probe)
      const charWidth = probe.getBoundingClientRect().width / 10
      probe.remove()
      const style = getComputedStyle(pre)
      const inner = pre.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      cols = Math.max(20, Math.floor(inner / charWidth) - 5)
    }

    const step = () => {
      t += 0.12
      buffers.forEach((b, k) => {
        b.push(sample(k, t))
        while (b.length > cols) b.shift()
      })
    }

    const render = () => {
      let html = ""
      buffers.forEach((b, k) => {
        const grid = Array.from({ length: ROWS }, () => Array<string>(cols).fill(" "))
        b.forEach((v, x) => {
          const y = Math.max(0, Math.min(ROWS - 1, Math.round(MID - v * 1.4)))
          grid[y][x] = "•"
        })
        grid.forEach((row, r) => {
          const label = r === MID ? `<b>${CHANNELS[k].name.padEnd(4)}</b>` : "    "
          html += `${label}│${row.join("")}\n`
        })
      })
      html += `    └${"─".repeat(cols)}\n      simulated · Fz Cz Pz`
      pre.innerHTML = html
    }

    measure()
    for (let i = 0; i < cols; i++) step()
    render()

    const onResize = () => {
      measure()
      render()
    }
    window.addEventListener("resize", onResize)

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const timer = reduce
      ? undefined
      : window.setInterval(() => {
          step()
          render()
        }, 60)

    return () => {
      window.removeEventListener("resize", onResize)
      if (timer) window.clearInterval(timer)
    }
  }, [])

  return (
    <div aria-hidden="true" className="dither-rule overflow-hidden">
      <pre
        ref={preRef}
        className="mx-auto max-w-6xl overflow-hidden whitespace-pre px-6 py-4 font-mono text-[11px] leading-[0.95] text-muted-foreground [&_b]:font-medium [&_b]:text-accent"
      />
    </div>
  )
}
