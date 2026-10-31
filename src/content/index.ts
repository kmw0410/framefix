import { readSettings, normalize } from '../shared/settings';
const send = async () => {
  try { window.postMessage({ channel: 'youtube-auto-hd', type: 'settings', settings: await readSettings() }, location.origin); } catch { /* Extension may have been reloaded. */ }
};
window.addEventListener('message', event => {
  if (event.source === window && event.origin === location.origin && event.data?.channel === 'youtube-auto-hd' && event.data.type === 'ready') void send();
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.settings) window.postMessage({ channel: 'youtube-auto-hd', type: 'settings', settings: normalize(changes.settings.newValue) }, location.origin);
});
void send();
