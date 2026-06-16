/**
 * Curated media — verified diagrams and Wikimedia Commons photos only.
 */

export const media = {
  /** Wikimedia Commons — International 10-20 system (MCN), public domain */
  eeg1020: {
    src: '/images/eeg-10-20-system.png',
    alt: 'International 10-20 EEG electrode placement diagram (modified combinatorial nomenclature)',
    credit: 'Wikimedia Commons: International 10-20 system for EEG-MCN',
  },
  /** Wikimedia Commons — EEG Recording Cap.jpg (CC BY-SA) */
  eegRecordingCap: {
    src: '/images/eeg-recording-cap.jpg',
    alt: 'EEG recording cap with electrodes placed on the scalp',
    credit: 'Wikimedia Commons: EEG Recording Cap',
  },
  /** Wikimedia Commons — U.S. Navy BUMED, public domain */
  eegClinicalSetup: {
    src: '/images/eeg-clinical-setup.jpg',
    alt: 'Clinician operating an EEG machine during a recording session',
    credit: 'Wikimedia Commons: U.S. Navy BUMED Library and Archives',
  },
} as const

export type MediaKey = keyof typeof media
