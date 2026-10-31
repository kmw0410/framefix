import type { Settings } from './settings';
export type Quality = { id: string; height: number; enhanced: boolean };
export function chooseQuality(levels: Quality[], settings: Settings): Quality | undefined {
  if (!settings.enabled) return;
  const usable = levels.filter(q => q.height > 0 && (settings.preferEnhancedBitrate || !q.enhanced));
  const heights = [...new Set(usable.map(q => q.height))].sort((a,b) => b-a);
  const height = heights.find(h => h <= Number(settings.quality)) ?? heights.at(-1);
  const same = usable.filter(q => q.height === height);
  return same.find(q => q.enhanced === settings.preferEnhancedBitrate) ?? same[0];
}
