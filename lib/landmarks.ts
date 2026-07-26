/**
 * Shared geometry for the cranial-landmark visuals (top-down, nose-up).
 * Both the static reference diagram and the interactive lesson import this
 * so their dot positions can never drift apart.
 */

export const LANDMARK_VIEW = { w: 240, h: 250, cx: 120, cy: 127, r: 88 } as const

export interface Landmark {
  id: string
  label: string
  cx: number
  cy: number
  /** One-line teaching hint shown as feedback in the lesson. */
  hint: string
}

export const LANDMARKS: Landmark[] = [
  {
    id: "nasion",
    label: "Nasion",
    cx: 120,
    cy: 39,
    hint: "The dip where the top of the nose bridge meets the forehead, on the front midline.",
  },
  {
    id: "inion",
    label: "Inion",
    cx: 120,
    cy: 215,
    hint: "The bony bump at the back of the skull, on the midline — feel for it low on the occiput.",
  },
  {
    id: "preauricular-l",
    label: "Left preauricular point",
    cx: 32,
    cy: 127,
    hint: "The small notch just in front of the left ear canal.",
  },
  {
    id: "preauricular-r",
    label: "Right preauricular point",
    cx: 208,
    cy: 127,
    hint: "The small notch just in front of the right ear canal.",
  },
  {
    id: "vertex",
    label: "Vertex (Cz)",
    cx: 120,
    cy: 127,
    hint: "The top of the head, where the nasion-inion and ear-to-ear lines cross. Cz goes here.",
  },
]
