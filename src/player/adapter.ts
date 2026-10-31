import type { Quality } from '../shared/quality';
export interface Player extends HTMLElement {
  getAvailableQualityLevels?: () => string[];
  getPlaybackQuality?: () => string;
  setPlaybackQualityRange?: (min: string, max: string) => void;
  setPlaybackQuality?: (quality: string) => void;
}
const heights: Record<string, number> = { tiny:144, small:240, medium:360, large:480, hd720:720, hd1080:1080, hd1440:1440, hd2160:2160, hd2880:2880, highres:4320 };
// Only use identifiers the current player exposes as available. Never click upsell menu items.
export function parseQuality(id: string): Quality | undefined {
  const base = id.replace(/[_\s-]?premium$/i, '');
  const height = heights[base];
  return height ? { id, height, enhanced: /premium/i.test(id) } : undefined;
}
export function available(player: Player): Quality[] {
  const ids = player.getAvailableQualityLevels?.();
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string').map(parseQuality).filter((q): q is Quality => !!q) : [];
}
export function apply(player: Player, id: string) {
  if (!player.setPlaybackQualityRange) return false;
  player.setPlaybackQualityRange(id, id);
  player.setPlaybackQuality?.(id);
  return true;
}
