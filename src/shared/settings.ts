export const qualities = ['144','240','360','480','720','1080','1440','2160','4320'] as const;
export type Settings = { enabled: boolean; quality: typeof qualities[number]; preferEnhancedBitrate: boolean; theme: 'system' | 'light' | 'dark'; language: 'auto' | 'ko' | 'en' };
export const defaults: Settings = { enabled: true, quality: '1080', preferEnhancedBitrate: false, theme: 'system', language: 'auto' };
export function normalize(value: unknown): Settings {
  const v = (value && typeof value === 'object' ? value : {}) as Partial<Omit<Settings, 'quality'>> & { quality?: string };
  return { enabled: v.quality === 'auto' ? false : (typeof v.enabled === 'boolean' ? v.enabled : true), quality: qualities.includes(v.quality as Settings['quality']) ? v.quality as Settings['quality'] : defaults.quality,
    preferEnhancedBitrate: typeof v.preferEnhancedBitrate === 'boolean' ? v.preferEnhancedBitrate : false,
    theme: ['system','light','dark'].includes(v.theme!) ? v.theme! : 'system',
    language: ['auto','ko','en'].includes(v.language!) ? v.language! : 'auto' };
}
export async function readSettings() { return normalize((await chrome.storage.local.get('settings')).settings); }
