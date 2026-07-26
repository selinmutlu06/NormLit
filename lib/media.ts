/**
 * Curated media — verified diagrams and Wikimedia Commons photos only.
 */

export const media = {
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
