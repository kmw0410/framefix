import { defaults, normalize } from '../shared/settings';
import { chooseQuality } from '../shared/quality';
import { available, apply, type Player } from './adapter';
let settings = defaults;
let configured = false;
let attempts = 0;
let lastAttempt = 0;
let videoId = '';
let previousPlayer: Player | null = null;
let wasAd = false;
let released = false;
let enforcedId = '';
function reset() { attempts = 0; lastAttempt = 0; enforcedId = ''; }
function tick() {
  if (!configured || document.visibilityState === 'hidden') return;
  const player = document.querySelector<Player>('#movie_player');
  const url = new URL(location.href);
  if (!player || url.pathname !== '/watch') return;
  const id = url.searchParams.get('v') ?? '';
  if (id !== videoId || player !== previousPlayer) { videoId = id; previousPlayer = player; reset(); released = false; }
  const isAd = player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting');
  if (isAd) { wasAd = true; return; }
  if (wasAd) { wasAd = false; reset(); }
  if (Date.now() - lastAttempt < 2500) return;
  let counted = false;
  try {
    if (!settings.enabled) {
      if (!released && attempts < 5) { lastAttempt = Date.now(); attempts++; counted = true; released = apply(player, 'auto'); }
      return;
    }
    const target = chooseQuality(available(player), settings);
    if (!target) return;
    if (enforcedId === target.id && player.getPlaybackQuality?.() === target.id) { attempts = 0; return; }
    if (attempts >= 5) return;
    lastAttempt = Date.now(); attempts++; counted = true;
    if (apply(player, target.id)) enforcedId = target.id;
  } catch { lastAttempt = Date.now(); if (!counted) attempts++; }
}
window.addEventListener('message', event => {
  if (event.source !== window || event.origin !== location.origin || event.data?.channel !== 'youtube-auto-hd' || event.data.type !== 'settings') return;
  const next = normalize(event.data.settings);
  if (!configured || next.enabled !== settings.enabled || next.quality !== settings.quality || next.preferEnhancedBitrate !== settings.preferEnhancedBitrate) { reset(); released = false; }
  settings = next; configured = true; tick();
});
document.addEventListener('yt-navigate-finish', () => { reset(); tick(); });
document.addEventListener('loadedmetadata', () => { reset(); tick(); }, true);
document.addEventListener('visibilitychange', tick);
// A low-frequency check also detects player replacement and advertising transitions.
setInterval(tick, 1500);
window.postMessage({ channel:'youtube-auto-hd', type:'ready' }, location.origin);
