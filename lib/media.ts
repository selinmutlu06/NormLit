/**
 * Curated media — real photos/diagrams with known sources.
 * Prefer these paths over legacy v0-generated images in /public/images.
 */

export const media = {
  /** Wikimedia Commons — International 10-20 system (MCN), public domain */
  eeg1020: {
    src: '/images/eeg-10-20-system.png',
    alt: 'International 10-20 EEG electrode placement diagram (modified combinatorial nomenclature)',
    credit: 'Wikimedia Commons — International 10-20 system for EEG-MCN',
  },
  /** Unsplash — laboratory research */
  researchLab: {
    src: '/images/lab-researcher.jpg',
    alt: 'Researcher working in a laboratory',
    credit: 'Unsplash',
  },
  /** Unsplash — clinical / medical research */
  medicalResearch: {
    src: '/images/medical-research.jpg',
    alt: 'Medical research and clinical science setting',
    credit: 'Unsplash',
  },
} as const

export type MediaKey = keyof typeof media
