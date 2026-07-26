import { cn } from "@/lib/utils"
import { LANDMARKS } from "@/lib/landmarks"

/**
 * Top-down schematic of the four cranial landmarks used to place the cap:
 * nasion (front), inion (back), left/right preauricular points (sides), and
 * the vertex (Cz) where the two measurement lines cross. Matches the top-down,
 * nose-up orientation of the electrode map. Purely presentational; theme-aware.
 * Dot positions come from lib/landmarks so the lesson stays in sync.
 */
export function LandmarksDiagram({ className }: { className?: string }) {
  const accent = "var(--accent)"
  return (
    <svg
      viewBox="0 0 240 250"
      className={cn("h-auto w-full max-w-sm", className)}
      role="img"
      aria-label="Top-down head schematic marking the nasion at front, inion at back, left and right preauricular points at the sides, and the vertex (Cz) at the center"
    >
      {/* Head */}
      <circle
        cx="120"
        cy="127"
        r="88"
        fill="color-mix(in oklch, var(--muted) 55%, transparent)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      {/* Nose (front / top) */}
      <path d="M108 41 L120 20 L132 41 Z" fill="color-mix(in oklch, var(--muted) 55%, transparent)" stroke="var(--border)" strokeWidth="2" strokeLinejoin="round" />
      {/* Ears */}
      <path d="M32 116 q-10 11 0 22" fill="none" stroke="var(--border)" strokeWidth="2" />
      <path d="M208 116 q10 11 0 22" fill="none" stroke="var(--border)" strokeWidth="2" />

      {/* Measurement lines — nasion↔inion and ear↔ear, crossing at the vertex */}
      <line x1="120" y1="39" x2="120" y2="215" stroke="var(--foreground)" strokeWidth="1.25" strokeDasharray="4 4" opacity="0.4" />
      <line x1="32" y1="127" x2="208" y2="127" stroke="var(--foreground)" strokeWidth="1.25" strokeDasharray="4 4" opacity="0.4" />

      {/* Landmark dots (positions shared with the lesson) */}
      {LANDMARKS.filter((l) => l.id !== "vertex").map((l) => (
        <circle key={l.id} cx={l.cx} cy={l.cy} r="5.5" fill={accent} stroke="var(--background)" strokeWidth="1.5" />
      ))}
      {/* Vertex (Cz) — emphasized */}
      <circle cx="120" cy="127" r="7.5" fill={accent} stroke="var(--background)" strokeWidth="2" />
      <circle cx="120" cy="127" r="12" fill="none" stroke={accent} strokeWidth="1.25" opacity="0.5" />

      {/* Labels */}
      <text x="120" y="12" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--foreground)">Nasion</text>
      <text x="120" y="238" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--foreground)">Inion</text>
      <text x="120" y="112" textAnchor="middle" fontSize="11" fontWeight="600" fill={accent}>Vertex (Cz)</text>
      <text x="16" y="152" textAnchor="start" fontSize="10.5" fontWeight="500" fill="var(--muted-foreground)">Preauricular</text>
      <text x="224" y="152" textAnchor="end" fontSize="10.5" fontWeight="500" fill="var(--muted-foreground)">Preauricular</text>
    </svg>
  )
}
