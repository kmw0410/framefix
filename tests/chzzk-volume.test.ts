import test from 'node:test';
import assert from 'node:assert/strict';
import { createVolumeInitializer } from '../src/chzzk/volume';
test('waits for controls, retries saved-volume restoration, then stops', () => {
  const c = createVolumeInitializer(); const video = { volume: 0.3 };
  assert.equal(c.apply(video, '/live/a', true, false, 100), false);
  assert.equal(video.volume, 0.3);
  assert.equal(c.apply(video, '/live/a', true, true, 200), true);
  video.volume = 0.4;
  assert.equal(c.apply(video, '/live/a', true, true, 1700), true);
  c.apply(video, '/live/a', true, true, 3200);
  c.apply(video, '/live/a', true, true, 6200);
  video.volume = 0.2;
  c.apply(video, '/live/a', true, true, 6500);
  assert.equal(video.volume, 0.2);
});
test('manual gestures stop retries; route changes and explicit reset rearm', () => {
  const c = createVolumeInitializer(); const video = { volume: 0.4, muted: true };
  c.apply(video, '/live/a', true, true, 100);
  c.stop(); video.volume = 0.2;
  c.apply(video, '/live/a', true, true, 200);
  assert.equal(video.volume, 0.2);
  c.apply(video, '/live/b', true, true, 300);
  assert.equal(video.volume, 1);
  assert.equal(video.muted, true);
  c.stop(); c.reset(); video.volume = 0.3;
  c.apply(video, '/live/b', false, true, 400);
  assert.equal(video.volume, 0.3);
  c.apply(video, '/live/b', true, true, 500);
  assert.equal(video.volume, 1);
});
test('retries stop after eight seconds even if another script keeps lowering volume', () => {
  const c = createVolumeInitializer(); const video = { volume: 0.3 };
  c.apply(video, '/live/a', true, true, 100);
  video.volume = 0.2;
  c.apply(video, '/live/a', true, true, 8100);
  assert.equal(video.volume, 0.2);
});
