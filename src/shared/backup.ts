import { normalize, qualities, type Settings } from './settings';
export const MAX_BACKUP_BYTES = 64 * 1024;
export function parseBackup(text: string): Settings {
  const data: unknown = JSON.parse(text);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('importInvalid');
  const root = data as Record<string, unknown>;
  if (root.app !== 'framefix') throw new Error('importInvalid');
  if (root.version !== 1 && root.version !== 2) throw new Error('importVersion');
  const value = root.settings;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('importInvalid');
  const s = value as Record<string, unknown>;
  if (!(qualities.includes(s.quality as Settings['quality']) || (root.version === 1 && s.quality === 'auto')) || typeof s.preferEnhancedBitrate !== 'boolean' || !['system','light','dark'].includes(s.theme as string)) throw new Error('importInvalid');
  if (s.language !== undefined && !['auto','ko','en'].includes(s.language as string)) throw new Error('importInvalid');
  if ((root.version === 2 || s.enabled !== undefined) && typeof s.enabled !== 'boolean') throw new Error('importInvalid');
  return normalize(s);
}
export function serializeBackup(settings: Settings): string {
  return JSON.stringify({ app: 'framefix', version: 2, settings: {
    enabled: settings.enabled, quality: settings.quality, preferEnhancedBitrate: settings.preferEnhancedBitrate, theme: settings.theme, language: settings.language
  } }, null, 2) + '\n';
}
