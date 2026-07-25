import { cn } from "@/lib/utils"

/**
 * Schematic of the four external EOG electrodes on the face, drawn front-on.
 * Purely presentational; colors come from theme tokens so it works in light/dark.
 *   VEOG — vertical pair above and below one eye (blinks + up/down gaze)
 *   HEOG — horizontal pair at the outer canthus of each eye (left/right saccades)
 */
export function EogDiagram({ className }: { className?: string }) {
  const veog = "var(--chart-1)"
  const heog = "var(--chart-2)"
  return (
    <svg
      viewBox="0 0 260 180"
      className={cn("h-auto w-full max-w-xs", className)}
      role="img"
      aria-label="Face schematic showing VEOG electrodes above and below the left eye and HEOG electrodes at the outer corner of each eye"
    >
      {/* Face outline */}
      <ellipse
        cx="130"
        cy="92"
        rx="78"
        ry="82"
        fill="color-mix(in oklch, var(--muted) 60%, transparent)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      {/* Eyes */}
      <ellipse cx="100" cy="92" rx="17" ry="9" fill="none" stroke="var(--foreground)" strokeWidth="2" opacity="0.5" />
      <ellipse cx="160" cy="92" rx="17" ry="9" fill="none" stroke="var(--foreground)" strokeWidth="2" opacity="0.5" />
      <circle cx="100" cy="92" r="3.5" fill="var(--foreground)" opacity="0.5" />
      <circle cx="160" cy="92" r="3.5" fill="var(--foreground)" opacity="0.5" />
      {/* Nose + brow hints */}
      <path d="M130 96 v18 q0 6 6 6" fill="none" stroke="var(--foreground)" strokeWidth="1.5" opacity="0.35" />
      <path d="M83 76 q17 -9 34 0" fill="none" stroke="var(--foreground)" strokeWidth="1.5" opacity="0.35" />
      <path d="M143 76 q17 -9 34 0" fill="none" stroke="var(--foreground)" strokeWidth="1.5" opacity="0.35" />

      {/* VEOG — vertical pair on the left eye */}
      <line x1="100" y1="68" x2="100" y2="116" stroke={veog} strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="100" cy="68" r="6" fill={veog} />
      <circle cx="100" cy="116" r="6" fill={veog} />

      {/* HEOG — horizontal pair at the outer canthi */}
      <line x1="74" y1="92" x2="186" y2="92" stroke={heog} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
      <circle cx="74" cy="92" r="6" fill={heog} />
      <circle cx="186" cy="92" r="6" fill={heog} />

      {/* Labels */}
      <text x="100" y="58" textAnchor="middle" fontSize="11" fontWeight="600" fill={veog}>VEOG</text>
      <text x="60" y="118" textAnchor="middle" fontSize="11" fontWeight="600" fill={heog}>HEOG</text>
    </svg>
  )
}
