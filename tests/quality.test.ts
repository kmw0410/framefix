import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseQuality, type Quality } from '../src/shared/quality';
import { defaults, normalize } from '../src/shared/settings';
import { parseQuality } from '../src/player/adapter';
const levels: Quality[] = [
  {id:'hd2160',height:2160,enhanced:false},
  {id:'hd1080',height:1080,enhanced:false},
  {id:'hd1080_premium',height:1080,enhanced:true},
  {id:'medium',height:360,enhanced:false}
];
test('matches preferred quality and toggles enhanced bitrate', () => {
  assert.equal(chooseQuality(levels,defaults)?.id,'hd1080');
  assert.equal(chooseQuality(levels,{...defaults,preferEnhancedBitrate:true})?.id,'hd1080_premium');
});
test('never lowers resolution just to select enhanced bitrate', () => {
  assert.equal(chooseQuality(levels,{...defaults,quality:'2160',preferEnhancedBitrate:true})?.id,'hd2160');
});
test('falls back below target, or to lowest when nothing below exists', () => {
  assert.equal(chooseQuality(levels,{...defaults,quality:'720'})?.id,'medium');
  assert.equal(chooseQuality(levels,{...defaults,quality:'144'})?.id,'medium');
  assert.equal(chooseQuality(levels.filter(q=>!q.enhanced),{...defaults,preferEnhancedBitrate:true})?.id,'hd1080');
});
test('auto, empty lists and unsupported player identifiers are safe', () => {
  assert.equal(chooseQuality(levels,{...defaults,enabled:false}),undefined);
  assert.equal(chooseQuality([],defaults),undefined);
  assert.equal(parseQuality('unknown'),undefined);
  assert.deepEqual(parseQuality('hd1080_premium'),{id:'hd1080_premium',height:1080,enhanced:true});
});
test('invalid settings normalize and theme defaults to system', () => {
  assert.deepEqual(normalize(null),defaults);
  assert.deepEqual(normalize({quality:'999',theme:'evil',preferEnhancedBitrate:'true'}),defaults);
  assert.equal(normalize({theme:'dark'}).theme,'dark');
});

test('legacy automatic quality migrates to OFF with a usable saved quality', () => {
  assert.deepEqual(normalize({...defaults, quality:'auto'}), {...defaults,enabled:false,quality:'1080'});
  assert.equal(normalize({...defaults, enabled:false, quality:'2160'}).quality, '2160');
});
