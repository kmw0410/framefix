import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBackup, serializeBackup } from '../src/shared/backup';
import { defaults } from '../src/shared/settings';
test('backup round trip preserves settings', () => {
  const settings = { ...defaults, theme: 'dark' as const, language: 'en' as const, preferEnhancedBitrate: true };
  assert.deepEqual(parseBackup(serializeBackup(settings)), settings);
});
test('rejects malformed, foreign, incomplete and invalid settings', () => {
  for (const value of ['{', 'null', '[]', JSON.stringify({app:'other',version:1,settings:defaults}),
    JSON.stringify({app:'framefix',version:1,settings:{}}),
    ...[{quality:'999'}, {preferEnhancedBitrate:'true'}, {theme:'unknown'}].map(change=>JSON.stringify({app:'framefix',version:1,settings:{...defaults,...change}}))]) {
    assert.throws(()=>parseBackup(value));
  }
});
test('rejects unsupported versions and only imports known settings', () => {
  assert.throws(()=>parseBackup(JSON.stringify({app:'framefix',version:4,settings:defaults})), /importVersion/);
  assert.deepEqual(parseBackup(JSON.stringify({app:'framefix',version:1,settings:{...defaults,extra:123}})), defaults);
});

test('old backups default to automatic language and invalid language is rejected', () => {
  const { language, ...oldSettings } = defaults;
  assert.equal(parseBackup(JSON.stringify({app:'framefix',version:1,settings:oldSettings})).language, 'auto');
  assert.throws(()=>parseBackup(JSON.stringify({app:'framefix',version:1,settings:{...defaults,language:'fr'}})), /importInvalid/);
});

test('backup v2 retains OFF settings and v1 automatic quality migrates', () => {
  const off = {...defaults,enabled:false,quality:'2160' as const};
  assert.deepEqual(parseBackup(serializeBackup(off)), off);
  const old = parseBackup(JSON.stringify({app:'framefix',version:1,settings:{quality:'auto',theme:'dark',preferEnhancedBitrate:true}}));
  assert.equal(old.enabled, false);
  assert.equal(old.quality, '1080');
  assert.throws(()=>parseBackup(JSON.stringify({app:'framefix',version:2,settings:{quality:'1080',theme:'dark',preferEnhancedBitrate:true}})), /importInvalid/);
});

test('CHZZK settings round trip independently and reject malformed v3', () => {
  const settings = { ...defaults, enabled: false, chzzkEnabled: true, chzzkMaxVolume: false };
  assert.deepEqual(parseBackup(serializeBackup(settings)), settings);
  assert.throws(() => parseBackup(JSON.stringify({ app: 'framefix', version: 3, settings: { ...settings, chzzkMaxVolume: 'yes' } })), /importInvalid/);
  const legacy = { enabled: false, quality: '2160', preferEnhancedBitrate: false, theme: 'system' };
  const migrated = parseBackup(JSON.stringify({ app: 'framefix', version: 2, settings: legacy }));
  assert.equal(migrated.quality, '2160');
  assert.equal(migrated.chzzkEnabled, true);
});
