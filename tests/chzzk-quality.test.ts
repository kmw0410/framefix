import test from 'node:test';
import assert from 'node:assert/strict';
import { CHZZK_MAX_HEIGHT, selectChzzkHeight } from '../src/chzzk/quality';

const heights = [4320, 2160, 1440, 1080, 720, 480];

test('CHZZK stays at FHD even when a higher quality is configured', () => {
  assert.equal(CHZZK_MAX_HEIGHT, 1080);
  for (const quality of ['1080', '1440', '2160', '4320'] as const) {
    assert.equal(selectChzzkHeight(heights, quality), 1080);
  }
});

test('a configured quality below FHD caps the selection', () => {
  assert.equal(selectChzzkHeight([1080, 720, 480], '720'), 720);
  assert.equal(selectChzzkHeight([1080, 720, 480], '360'), 480);
});

test('invalid heights and empty lists are safe', () => {
  assert.equal(selectChzzkHeight([], '1080'), undefined);
  assert.equal(selectChzzkHeight([0, -1, NaN], '1080'), undefined);
});
