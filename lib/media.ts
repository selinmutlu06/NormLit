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
  /**
   * Wikimedia Commons — EEG Recording Cap.jpg (CC BY-SA).
   * NOTE: this is a passive ring-electrode cap, not a BioSemi ActiveTwo.
   * It illustrates holder/gel geometry only — captions must not imply BioSemi hardware.
   */
  eegRecordingCap: {
    src: '/images/eeg-recording-cap.jpg',
    alt: 'Gel-based EEG cap with ring electrodes seated in holders on the scalp',
    credit: 'Wikimedia Commons: EEG Recording Cap (CC BY-SA)',
  },
} as const

export type MediaKey = keyof typeof media
