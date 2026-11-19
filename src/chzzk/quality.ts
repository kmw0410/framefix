import type { Settings } from '../shared/settings';

// CHZZK playback is capped at FHD. A lower configured quality still wins.
export const CHZZK_MAX_HEIGHT = 1080;

export function selectChzzkHeight(heights: number[], quality: Settings['quality']): number | undefined {
  const limit = Math.min(Number(quality) || CHZZK_MAX_HEIGHT, CHZZK_MAX_HEIGHT);
  const usable = heights.filter(height => height > 0);
  // Mirror the YouTube policy: fall back to the lowest available level when nothing fits.
  return usable.filter(height => height <= limit).sort((a, b) => b - a)[0]
    ?? usable.sort((a, b) => a - b)[0];
}
