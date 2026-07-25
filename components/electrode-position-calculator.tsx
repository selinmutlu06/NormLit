"use client"

import { useMemo, useState } from "react"
import { Ruler, MapPin, Info, TriangleAlert } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * International 10-20 system position calculator.
 *
 * The 10-20 system places electrodes at fixed *percentages* along three
 * measured lines on the head. Given the measured length of each line (in cm),
 * the physical mark for every electrode is just that percentage of the length.
 * All fractions below are the standard 10-20 values (Jasper, 1958):
 *   - Sagittal midline (nasion -> inion): 10/20/20/20/20/10
 *   - Coronal line (left -> right preauricular, through Cz): 10/20/20/20/20/10
 *   - Circumference (through Fpz and Oz): frontal/occipital poles sit 5% off
 *     the midline, every lateral point 10% apart.
 */

type Point = { id: string; pct: number; note: string; old?: string; vertex?: boolean }

// Measured from the nasion, over the vertex, toward the inion (inion = 100%).
const SAGITTAL: Point[] = [
  { id: "Fpz", pct: 10, note: "Frontal pole" },
  { id: "Fz", pct: 30, note: "Frontal" },
  { id: "Cz", pct: 50, note: "Vertex", vertex: true },
  { id: "Pz", pct: 70, note: "Parietal" },
  { id: "Oz", pct: 90, note: "Occipital" },
]

// Measured from the LEFT preauricular point, over the vertex, to the right (= 100%).
const CORONAL: Point[] = [
  { id: "T7", pct: 10, note: "Left temporal", old: "T3" },
  { id: "C3", pct: 30, note: "Left central" },
  { id: "Cz", pct: 50, note: "Vertex", vertex: true },
  { id: "C4", pct: 70, note: "Right central" },
  { id: "T8", pct: 90, note: "Right temporal", old: "T4" },
]

// Measured around the circumference from Fpz, toward the participant's LEFT.
const CIRCUMFERENCE: Point[] = [
  { id: "Fp1", pct: 5, note: "Left frontal pole" },
  { id: "F7", pct: 15, note: "Left inferior frontal" },
  { id: "T7", pct: 25, note: "Left temporal", old: "T3" },
  { id: "P7", pct: 35, note: "Left posterior temporal", old: "T5" },
  { id: "O1", pct: 45, note: "Left occipital" },
  { id: "Oz", pct: 50, note: "Back midline", vertex: true },
  { id: "O2", pct: 55, note: "Right occipital" },
  { id: "P8", pct: 65, note: "Right posterior temporal", old: "T6" },
  { id: "T8", pct: 75, note: "Right temporal", old: "T4" },
  { id: "F8", pct: 85, note: "Right inferior frontal" },
  { id: "Fp2", pct: 95, note: "Right frontal pole" },
]

// Generous plausibility ranges for adult heads (cm). Outside these we nudge, never block.
const RANGES = {
  nasionInion: { min: 28, max: 42, label: "Typical adult 32-38 cm" },
  coronal: { min: 28, max: 42, label: "Typical adult 32-38 cm" },
  circumference: { min: 46, max: 66, label: "Typical adult 52-60 cm" },
}

function parseCm(value: string): number | null {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function cmAt(pct: number, length: number): string {
  return `${((pct / 100) * length).toFixed(1)} cm`
}

interface FieldProps {
  id: string
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  range: { min: number; max: number; label: string }
}

function MeasurementField({ id, label, hint, value, onChange, range }: FieldProps) {
  const parsed = parseCm(value)
  const outOfRange = parsed !== null && (parsed < range.min || parsed > range.max)
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          placeholder="cm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 font-mono"
          aria-describedby={`${id}-hint`}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
          cm
        </span>
      </div>
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        {hint}
      </p>
      {outOfRange && (
        <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <TriangleAlert className="size-3 shrink-0" />
          Unusual value — double-check. {range.label}.
        </p>
      )}
    </div>
  )
}

function PositionTable({
  caption,
  reference,
  points,
  length,
}: {
  caption: string
  reference: string
  points: Point[]
  length: number | null
}) {
  return (
    <div className="rounded-xl border border-border">
      <div className="border-b border-border px-4 py-3">
        <p className="font-medium">{caption}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Distance measured {reference}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
              <th className="py-2 pl-4 pr-3 font-medium">Electrode</th>
              <th className="px-3 py-2 font-medium">%</th>
              <th className="px-3 py-2 font-medium">Mark at</th>
              <th className="hidden py-2 pl-3 pr-4 font-medium sm:table-cell">Region</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-border/40 last:border-0 ${
                  p.vertex ? "bg-accent/5" : ""
                }`}
              >
                <td className="py-2 pl-4 pr-3">
                  <span className="font-mono font-medium">{p.id}</span>
                  {p.old && (
                    <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                      ({p.old})
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{p.pct}%</td>
                <td className="px-3 py-2 font-mono font-medium">
                  {length ? cmAt(p.pct, length) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="hidden py-2 pl-3 pr-4 text-muted-foreground sm:table-cell">
                  {p.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ElectrodePositionCalculator() {
  const [nasionInion, setNasionInion] = useState("")
  const [coronal, setCoronal] = useState("")
  const [circumference, setCircumference] = useState("")

  const niLen = useMemo(() => parseCm(nasionInion), [nasionInion])
  const corLen = useMemo(() => parseCm(coronal), [coronal])
  const circLen = useMemo(() => parseCm(circumference), [circumference])

  // Cz cross-check: the vertex is the 50% mark on BOTH the sagittal and coronal
  // lines. Showing both distances lets the operator confirm the marks intersect.
  const czCheck =
    niLen && corLen
      ? { sagittal: (niLen * 0.5).toFixed(1), coronal: (corLen * 0.5).toFixed(1) }
      : null

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-2">
          <Ruler className="mt-0.5 size-5 shrink-0 text-accent" />
          <div>
            <p className="font-medium">Measure three lines with a flexible tape</p>
            <p className="text-sm text-muted-foreground">
              Enter each length in centimeters. Positions update as you type — you only
              need the lines you plan to mark.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MeasurementField
            id="nasion-inion"
            label="Nasion → inion"
            hint="Over the top of the head, front to back."
            value={nasionInion}
            onChange={setNasionInion}
            range={RANGES.nasionInion}
          />
          <MeasurementField
            id="coronal"
            label="Ear → ear (through vertex)"
            hint="Left to right preauricular point, over the top."
            value={coronal}
            onChange={setCoronal}
            range={RANGES.coronal}
          />
          <MeasurementField
            id="circumference"
            label="Head circumference"
            hint="Around through Fpz (front) and Oz (back)."
            value={circumference}
            onChange={setCircumference}
            range={RANGES.circumference}
          />
        </div>
      </div>

      {/* Cz cross-check */}
      {czCheck && (
        <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <MapPin className="mt-0.5 size-5 shrink-0 text-accent" />
          <div className="text-sm">
            <p className="font-medium">Vertex (Cz) cross-check</p>
            <p className="mt-1 text-muted-foreground">
              Cz is the 50% mark on both lines:{" "}
              <span className="font-mono font-medium text-foreground">{czCheck.sagittal} cm</span>{" "}
              back from the nasion and{" "}
              <span className="font-mono font-medium text-foreground">{czCheck.coronal} cm</span>{" "}
              from the left ear. Mark both and confirm they cross at the same point before
              seating the cap.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PositionTable
          caption="Sagittal midline"
          reference="from the nasion, over the vertex"
          points={SAGITTAL}
          length={niLen}
        />
        <PositionTable
          caption="Coronal line (through Cz)"
          reference="from the left preauricular point"
          points={CORONAL}
          length={corLen}
        />
      </div>

      <PositionTable
        caption="Circumference chain"
        reference="around from Fpz, toward the participant's left"
        points={CIRCUMFERENCE}
        length={circLen}
      />

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Percentages are the fixed 10-20 fractions; the centimeter marks are derived from
        your measurements. The circumference should pass through your Fpz and Oz marks — if
        it doesn&apos;t, re-check the sagittal line before gelling.
      </p>
    </div>
  )
}
