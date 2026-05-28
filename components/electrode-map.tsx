"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

// Full 10-20 system electrode positions with extended 10-10 system
// Positions are in percentage coordinates on a circular head map
const electrodes = [
  // Midline electrodes (z = zero/midline)
  { id: "Fpz", x: 50, y: 10, region: "frontal", description: "Frontopolar midline" },
  { id: "Fz", x: 50, y: 25, region: "frontal", description: "Frontal midline" },
  { id: "FCz", x: 50, y: 35, region: "frontal", description: "Frontocentral midline" },
  { id: "Cz", x: 50, y: 50, region: "central", description: "Central midline (vertex)" },
  { id: "CPz", x: 50, y: 62, region: "parietal", description: "Centroparietal midline" },
  { id: "Pz", x: 50, y: 75, region: "parietal", description: "Parietal midline" },
  { id: "POz", x: 50, y: 85, region: "occipital", description: "Parieto-occipital midline" },
  { id: "Oz", x: 50, y: 92, region: "occipital", description: "Occipital midline" },
  { id: "Iz", x: 50, y: 98, region: "occipital", description: "Inion reference" },
  
  // Frontal left
  { id: "Fp1", x: 32, y: 12, region: "frontal", description: "Left frontopolar" },
  { id: "AF7", x: 20, y: 18, region: "frontal", description: "Left anterior frontal" },
  { id: "AF3", x: 38, y: 16, region: "frontal", description: "Left anterior frontal" },
  { id: "F7", x: 12, y: 30, region: "frontal", description: "Left lateral frontal" },
  { id: "F5", x: 22, y: 28, region: "frontal", description: "Left frontal" },
  { id: "F3", x: 32, y: 26, region: "frontal", description: "Left frontal" },
  { id: "F1", x: 42, y: 25, region: "frontal", description: "Left frontal" },
  
  // Frontal right
  { id: "Fp2", x: 68, y: 12, region: "frontal", description: "Right frontopolar" },
  { id: "AF8", x: 80, y: 18, region: "frontal", description: "Right anterior frontal" },
  { id: "AF4", x: 62, y: 16, region: "frontal", description: "Right anterior frontal" },
  { id: "F8", x: 88, y: 30, region: "frontal", description: "Right lateral frontal" },
  { id: "F6", x: 78, y: 28, region: "frontal", description: "Right frontal" },
  { id: "F4", x: 68, y: 26, region: "frontal", description: "Right frontal" },
  { id: "F2", x: 58, y: 25, region: "frontal", description: "Right frontal" },
  
  // Frontocentral left
  { id: "FT7", x: 8, y: 42, region: "temporal", description: "Left frontotemporal" },
  { id: "FC5", x: 18, y: 38, region: "frontal", description: "Left frontocentral" },
  { id: "FC3", x: 30, y: 36, region: "frontal", description: "Left frontocentral" },
  { id: "FC1", x: 42, y: 35, region: "frontal", description: "Left frontocentral" },
  
  // Frontocentral right
  { id: "FT8", x: 92, y: 42, region: "temporal", description: "Right frontotemporal" },
  { id: "FC6", x: 82, y: 38, region: "frontal", description: "Right frontocentral" },
  { id: "FC4", x: 70, y: 36, region: "frontal", description: "Right frontocentral" },
  { id: "FC2", x: 58, y: 35, region: "frontal", description: "Right frontocentral" },
  
  // Temporal/Central left
  { id: "T7", x: 5, y: 50, region: "temporal", description: "Left temporal (T3)" },
  { id: "C5", x: 16, y: 50, region: "central", description: "Left central" },
  { id: "C3", x: 30, y: 50, region: "central", description: "Left central" },
  { id: "C1", x: 42, y: 50, region: "central", description: "Left central" },
  
  // Temporal/Central right
  { id: "T8", x: 95, y: 50, region: "temporal", description: "Right temporal (T4)" },
  { id: "C6", x: 84, y: 50, region: "central", description: "Right central" },
  { id: "C4", x: 70, y: 50, region: "central", description: "Right central" },
  { id: "C2", x: 58, y: 50, region: "central", description: "Right central" },
  
  // Centroparietal left
  { id: "TP7", x: 8, y: 58, region: "temporal", description: "Left temporoparietal" },
  { id: "CP5", x: 18, y: 62, region: "parietal", description: "Left centroparietal" },
  { id: "CP3", x: 30, y: 62, region: "parietal", description: "Left centroparietal" },
  { id: "CP1", x: 42, y: 62, region: "parietal", description: "Left centroparietal" },
  
  // Centroparietal right
  { id: "TP8", x: 92, y: 58, region: "temporal", description: "Right temporoparietal" },
  { id: "CP6", x: 82, y: 62, region: "parietal", description: "Right centroparietal" },
  { id: "CP4", x: 70, y: 62, region: "parietal", description: "Right centroparietal" },
  { id: "CP2", x: 58, y: 62, region: "parietal", description: "Right centroparietal" },
  
  // Parietal left
  { id: "P7", x: 12, y: 72, region: "parietal", description: "Left lateral parietal" },
  { id: "P5", x: 22, y: 74, region: "parietal", description: "Left parietal" },
  { id: "P3", x: 32, y: 75, region: "parietal", description: "Left parietal" },
  { id: "P1", x: 42, y: 75, region: "parietal", description: "Left parietal" },
  
  // Parietal right
  { id: "P8", x: 88, y: 72, region: "parietal", description: "Right lateral parietal" },
  { id: "P6", x: 78, y: 74, region: "parietal", description: "Right parietal" },
  { id: "P4", x: 68, y: 75, region: "parietal", description: "Right parietal" },
  { id: "P2", x: 58, y: 75, region: "parietal", description: "Right parietal" },
  
  // Parieto-occipital
  { id: "PO7", x: 20, y: 84, region: "occipital", description: "Left parieto-occipital" },
  { id: "PO3", x: 35, y: 85, region: "occipital", description: "Left parieto-occipital" },
  { id: "PO4", x: 65, y: 85, region: "occipital", description: "Right parieto-occipital" },
  { id: "PO8", x: 80, y: 84, region: "occipital", description: "Right parieto-occipital" },
  
  // Occipital
  { id: "O1", x: 35, y: 92, region: "occipital", description: "Left occipital" },
  { id: "O2", x: 65, y: 92, region: "occipital", description: "Right occipital" },
  
  // External electrodes
  { id: "A1", x: 2, y: 50, region: "reference", description: "Left mastoid/earlobe" },
  { id: "A2", x: 98, y: 50, region: "reference", description: "Right mastoid/earlobe" },
]

// Region colors
const regionColors = {
  frontal: { bg: "bg-blue-500/20", border: "border-blue-500", text: "text-blue-600 dark:text-blue-400", fill: "#3b82f6" },
  central: { bg: "bg-green-500/20", border: "border-green-500", text: "text-green-600 dark:text-green-400", fill: "#22c55e" },
  parietal: { bg: "bg-amber-500/20", border: "border-amber-500", text: "text-amber-600 dark:text-amber-400", fill: "#f59e0b" },
  temporal: { bg: "bg-purple-500/20", border: "border-purple-500", text: "text-purple-600 dark:text-purple-400", fill: "#a855f7" },
  occipital: { bg: "bg-rose-500/20", border: "border-rose-500", text: "text-rose-600 dark:text-rose-400", fill: "#f43f5e" },
  reference: { bg: "bg-gray-500/20", border: "border-gray-500", text: "text-gray-600 dark:text-gray-400", fill: "#6b7280" },
}

/** Core 10-20 positions for training — avoids cluttering the map with 10-10 extensions */
const GUIDE_ELECTRODE_IDS = [
  "Fp1", "Fp2", "Fz", "F3", "F4", "F7", "F8",
  "Cz", "C3", "C4", "T7", "T8",
  "Pz", "P3", "P4", "O1", "O2", "Oz",
] as const

interface ElectrodeMapProps {
  highlightedRegion?: string
  onElectrodeClick?: (electrode: typeof electrodes[0]) => void
  showLabels?: boolean
  size?: "sm" | "md" | "lg"
  /** "guide" = fewer electrodes, legend below map, no naming sidebar */
  variant?: "full" | "guide"
}

export function ElectrodeMap({ 
  highlightedRegion, 
  onElectrodeClick,
  showLabels = true,
  size = "lg",
  variant = "full",
}: ElectrodeMapProps) {
  const [hoveredElectrode, setHoveredElectrode] = useState<typeof electrodes[0] | null>(null)
  const [selectedElectrode, setSelectedElectrode] = useState<typeof electrodes[0] | null>(null)

  const sizeClasses = {
    sm: "w-64 h-64",
    md: "w-96 h-96",
    lg: "w-[500px] h-[500px]"
  }

  const electrodeSizes = {
    sm: { r: 8, fontSize: 6 },
    md: { r: 10, fontSize: 7 },
    lg: { r: 12, fontSize: 8 }
  }

  const handleElectrodeClick = (electrode: typeof electrodes[0]) => {
    setSelectedElectrode(electrode)
    onElectrodeClick?.(electrode)
  }

  const isGuide = variant === "guide"
  const visibleElectrodes = isGuide
    ? electrodes.filter((e) => GUIDE_ELECTRODE_IDS.includes(e.id as (typeof GUIDE_ELECTRODE_IDS)[number]))
    : electrodes
  const mapSize = isGuide ? "md" : size
  const showElectrodeLabels = isGuide ? true : showLabels
  const dotScale = isGuide ? 1.25 : 1

  const legend = (
    <div className="flex flex-wrap gap-2 justify-center">
      {Object.entries(regionColors)
        .filter(([region]) => region !== "reference" || !isGuide)
        .map(([region, colors]) => (
          <div
            key={region}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-opacity",
              colors.bg,
              colors.border,
              colors.text,
              highlightedRegion && highlightedRegion !== region && "opacity-40",
            )}
          >
            <div className="size-2 rounded-full" style={{ backgroundColor: colors.fill }} />
            {region}
          </div>
        ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Main map container */}
      <div
        className={cn(
          "flex flex-col gap-4 items-center justify-center",
          !isGuide && "lg:flex-row lg:items-start lg:gap-6",
        )}
      >
        {/* SVG Map */}
        <div className={cn("relative mx-auto shrink-0", sizeClasses[mapSize])}>
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* Head outline */}
            <ellipse 
              cx="50" 
              cy="50" 
              rx="48" 
              ry="48" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
              className="text-border"
            />
            
            {/* Nose indicator */}
            <path 
              d="M 50 2 L 47 8 L 53 8 Z" 
              fill="currentColor"
              className="text-muted-foreground"
            />
            
            {/* Ears */}
            <ellipse cx="2" cy="50" rx="2" ry="5" fill="currentColor" className="text-muted-foreground/50" />
            <ellipse cx="98" cy="50" rx="2" ry="5" fill="currentColor" className="text-muted-foreground/50" />
            
            {/* Cross-hairs for reference */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.2" className="text-border" strokeDasharray="2,2" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.2" className="text-border" strokeDasharray="2,2" />
            
            {/* Electrodes */}
            {visibleElectrodes.map((electrode) => {
              const colors = regionColors[electrode.region as keyof typeof regionColors]
              const isHighlighted = !highlightedRegion || highlightedRegion === electrode.region
              const isHovered = hoveredElectrode?.id === electrode.id
              const isSelected = selectedElectrode?.id === electrode.id
              
              return (
                <g 
                  key={electrode.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleElectrodeClick(electrode)}
                  onMouseEnter={() => setHoveredElectrode(electrode)}
                  onMouseLeave={() => setHoveredElectrode(null)}
                  style={{ 
                    opacity: isHighlighted ? 1 : 0.3,
                    transform: isHovered || isSelected ? 'scale(1.2)' : 'scale(1)',
                    transformOrigin: `${electrode.x}% ${electrode.y}%`
                  }}
                >
                  {/* Electrode circle */}
                  <circle
                    cx={electrode.x}
                    cy={electrode.y}
                    r={(electrodeSizes[mapSize].r * dotScale) / 10}
                    fill={colors.fill}
                    stroke={isSelected ? "#fff" : "transparent"}
                    strokeWidth={isSelected ? 0.3 : 0}
                    className="transition-all duration-200"
                  />
                  
                  {/* Label */}
                  {showElectrodeLabels && (
                    <text
                      x={electrode.x}
                      y={electrode.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={electrodeSizes[mapSize].fontSize / 10}
                      fontWeight="500"
                      fill="#fff"
                      className="pointer-events-none select-none font-mono"
                      style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
                    >
                      {electrode.id}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
          
          {/* Hover tooltip */}
          {hoveredElectrode && (
            <div 
              className="absolute z-10 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg text-sm pointer-events-none"
              style={{
                left: `${hoveredElectrode.x}%`,
                top: `${hoveredElectrode.y}%`,
                transform: 'translate(-50%, -120%)'
              }}
            >
              <p className="font-mono font-semibold">{hoveredElectrode.id}</p>
              <p className="text-xs text-muted-foreground">{hoveredElectrode.description}</p>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className={cn("w-full space-y-4", !isGuide && "lg:w-72")}>
          {selectedElectrode ? (
            <div className="rounded-lg border border-border bg-card space-y-2 p-4">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-xl font-bold",
                    regionColors[selectedElectrode.region as keyof typeof regionColors].text,
                  )}
                >
                  {selectedElectrode.id}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium capitalize",
                    regionColors[selectedElectrode.region as keyof typeof regionColors].bg,
                    regionColors[selectedElectrode.region as keyof typeof regionColors].text,
                  )}
                >
                  {selectedElectrode.region}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedElectrode.description}</p>
              {!isGuide && (
                <div className="space-y-2 border-t border-border pt-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Position:</span> ({selectedElectrode.x}%, {selectedElectrode.y}%)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Naming:</span>{" "}
                    {selectedElectrode.id.includes("z")
                      ? "Midline (z = zero)"
                      : selectedElectrode.id.match(/[13579]$/)
                        ? "Left hemisphere (odd numbers)"
                        : selectedElectrode.id.match(/[2468]$/)
                          ? "Right hemisphere (even numbers)"
                          : "Reference electrode"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Click an electrode on the map for details
            </p>
          )}

          {!isGuide && (
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <h4 className="text-sm font-medium">Electrode Naming Convention</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="w-8 font-mono font-semibold text-foreground">Fp</span>
                  <span>Frontopolar</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-8 font-mono font-semibold text-foreground">F</span>
                  <span>Frontal</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-8 font-mono font-semibold text-foreground">C</span>
                  <span>Central</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-8 font-mono font-semibold text-foreground">P</span>
                  <span>Parietal</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-8 font-mono font-semibold text-foreground">O</span>
                  <span>Occipital</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-8 font-mono font-semibold text-foreground">T</span>
                  <span>Temporal</span>
                </div>
              </div>
              <div className="space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                <p><span className="font-medium">z</span> = Midline</p>
                <p><span className="font-medium">Odd #s</span> = Left hemisphere</p>
                <p><span className="font-medium">Even #s</span> = Right hemisphere</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {legend}

      {!isGuide && (
        <p className="text-center text-xs text-muted-foreground">
          {electrodes.length} positions (10-10 extended). For the standard 10-20 set, use guide mode.
        </p>
      )}
    </div>
  )
}

// Simplified version for smaller displays
export function ElectrodeMapMini({ 
  highlightedRegion 
}: { 
  highlightedRegion?: string 
}) {
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Head outline */}
        <ellipse 
          cx="50" cy="50" rx="45" ry="45" 
          fill="none" stroke="currentColor" strokeWidth="1"
          className="text-border"
        />
        
        {/* Nose */}
        <path d="M 50 5 L 47 12 L 53 12 Z" fill="currentColor" className="text-muted-foreground" />
        
        {/* Simplified electrode regions */}
        {electrodes
          .filter(e => ['Fz', 'Cz', 'Pz', 'Oz', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4', 'T7', 'T8'].includes(e.id))
          .map((electrode) => {
            const colors = regionColors[electrode.region as keyof typeof regionColors]
            const isHighlighted = !highlightedRegion || highlightedRegion === electrode.region
            
            return (
              <circle
                key={electrode.id}
                cx={electrode.x}
                cy={electrode.y}
                r={3}
                fill={colors.fill}
                opacity={isHighlighted ? 1 : 0.3}
              />
            )
          })}
      </svg>
    </div>
  )
}
