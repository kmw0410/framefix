import { createVolumeInitializer } from './volume';
import { readSettings, normalize, type Settings } from '../shared/settings';
let settings: Settings | undefined;
let lastClick = 0;
let attempts = 0;
let route = '';
let previous: HTMLVideoElement | null = null;
const volume = createVolumeInitializer();
function tick() {
  if (!settings || document.hidden || !/^\/(live|video)\//.test(location.pathname)) return;
  const layout = document.querySelector('#live_player_layout, #vod_player_layout, #video_player_layout, #player_layout, .chzzk_player');
  const videos = [...(layout ?? document).querySelectorAll<HTMLVideoElement>('video')].filter(v => !v.ended && v.getClientRects().length > 0);
  const video = videos.find(v => v.matches('.webplayer-internal-video')) ?? (videos.length === 1 ? videos[0] : null);
  if (!video) return;
  if (route !== location.pathname || previous !== video) {
    route = location.pathname; previous = video; attempts = 0; lastClick = 0;
  }
  const controls = (layout ?? video.closest('.pzp, .pzp-pc') ?? document).querySelector('.pzp-pc__volume-control');
  volume.apply(video, location.pathname, settings.chzzkMaxVolume, !!controls);
  if (!settings.chzzkEnabled || Date.now() - lastClick < 3000 || attempts >= 5) return;
  const root = video.closest('.pzp-pc, .pzp');
  if (!root) return;
  const items = [...root.querySelectorAll<HTMLElement>('.pzp-pc-ui-setting-quality-item')];
  const candidates = items.map(item => ({ item, height: Number(item.querySelector('.pzp-pc-ui-setting-quality-item__prefix')?.textContent?.match(/(\d+)p/i)?.[1]) }))
    .filter(q => q.height > 0 && q.height <= 1080).sort((a, b) => b.height - a.height);
  const target = candidates[0];
  if (!target) return;
  if (target.item.getAttribute('aria-checked') === 'true' || target.item.classList.contains('pzp-pc-ui-setting-quality-item--selected')) { attempts = 0; return; }
  lastClick = Date.now(); attempts++;
  target.item.click();
}
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.settings) return;
  const next = normalize(changes.settings.newValue);
  if (next.chzzkMaxVolume && !settings?.chzzkMaxVolume) volume.reset();
  settings = next; attempts = 0; lastClick = 0; tick();
});
document.addEventListener('loadedmetadata', () => { attempts = 0; tick(); }, true);
document.addEventListener('playing', () => { attempts = 0; tick(); }, true);
document.addEventListener('visibilitychange', tick);
void readSettings().then(value => { settings = value; tick(); });
setInterval(tick, 1500);

// A real volume gesture takes precedence over the short initialization retry.
for (const type of ['pointerdown', 'keydown', 'wheel']) {
  document.addEventListener(type, event => {
    if (!event.isTrusted || !(event.target instanceof Element)) return;
    const target = event.target;
    const control = target.closest('.pzp-pc__volume-control');
    const key = event instanceof KeyboardEvent && ['ArrowUp', 'ArrowDown', 'm', 'M'].includes(event.key) && target.closest('.pzp, .pzp-pc');
    if (control || key) volume.stop();
  }, true);
}
