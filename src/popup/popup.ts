import { t, setLanguage } from '../i18n';
import { createQualityPicker } from './quality-picker';
import { readSettings, type Settings } from '../shared/settings';
import { MAX_BACKUP_BYTES, parseBackup, serializeBackup } from '../shared/backup';
const importButton = document.querySelector<HTMLButtonElement>('#import-settings')!;
const exportButton = document.querySelector<HTMLButtonElement>('#export-settings')!;
const fileInput = document.querySelector<HTMLInputElement>('#settings-file')!;
let importing = false;
const languages = [...document.querySelectorAll<HTMLButtonElement>('[data-language]')];
const picker = createQualityPicker(value => { settings.quality = value; save(); });
const enabled = document.querySelector<HTMLInputElement>('#enabled')!;
const enabledState = document.querySelector<HTMLElement>('#enabled-state')!;
const enhanced = document.querySelector<HTMLInputElement>('#enhanced')!;
const status = document.querySelector<HTMLElement>('#status')!;
const themes = [...document.querySelectorAll<HTMLButtonElement>('[data-theme]')];
let settings: Settings;
let saving = Promise.resolve();
function translate() {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n!));
  themes.forEach(button => { button.title = t(`theme_${button.dataset.theme}`); button.setAttribute('aria-label', button.title); });
}
function render() {
  setLanguage(settings.language);
  translate();
  languages.forEach(button => {
    button.disabled = importing;
    button.setAttribute('aria-pressed', String(button.dataset.language === settings.language));
  });
  document.documentElement.dataset.theme = settings.theme;
  enabled.checked = settings.enabled;
  enabled.disabled = importing;
  enabledState.textContent = settings.enabled ? 'ON' : 'OFF';
  enabled.setAttribute('aria-label', t('extensionEnabled'));
  document.querySelector('#quality-hint')!.textContent = t(settings.enabled ? 'fixedHint' : 'disabledHint');
  picker.update(settings.quality, importing || !settings.enabled);
  importButton.disabled = importing;
  exportButton.disabled = importing;
  themes.forEach(button => button.disabled = importing);
  enhanced.checked = settings.preferEnhancedBitrate;
  enhanced.disabled = importing || !settings.enabled;
  themes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === settings.theme)));
}
function save() {
  render();
  const snapshot = { ...settings };
  status.textContent = t('saving');
  saving = saving.then(() => chrome.storage.local.set({ settings: snapshot }))
    .then(() => { status.textContent = t('saved'); })
    .catch(() => { status.textContent = t('saveError'); });
}
async function importFile() {
  const file = fileInput.files?.[0];
  fileInput.value = '';
  if (!file) return;
  importing = true;
  render();
  try {
    // Complete pending edits before replacing settings, and keep controls locked until committed.
    await saving;
    status.textContent = t('importing');
    if (file.size > MAX_BACKUP_BYTES) throw new Error('importTooLarge');
    const next = parseBackup(await file.text());
    try { await chrome.storage.local.set({ settings: next }); }
    catch { throw new Error('saveError'); }
    settings = next;
    setLanguage(settings.language);
    status.textContent = t('importSuccess');
  } catch (error) {
    const key = error instanceof Error && ['importVersion', 'importTooLarge', 'saveError'].includes(error.message) ? error.message : 'importInvalid';
    status.textContent = t(key);
  } finally {
    importing = false;
    render();
  }
}
function exportFile() {
  const url = URL.createObjectURL(new Blob([serializeBackup(settings)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'framefix-settings.json';
  document.body.append(link);
  link.click();
  link.remove();
  // Leave time for the browser to start the download before releasing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
async function init() {
  translate();
  enhanced.setAttribute('aria-describedby','enhanced-hint');
  settings = await readSettings();
  themes.forEach(button => button.disabled = false);
  render();
  status.textContent = t('saved');
  languages.forEach(button => button.addEventListener('click', () => { settings.language = button.dataset.language as Settings['language']; save(); }));
  importButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => { void importFile(); });
  exportButton.addEventListener('click', exportFile);
  enabled.addEventListener('change', () => { settings.enabled = enabled.checked; save(); });
  enhanced.addEventListener('change', () => { settings.preferEnhancedBitrate = enhanced.checked; save(); });
  themes.forEach(button => button.addEventListener('click', () => { settings.theme = button.dataset.theme as Settings['theme']; save(); }));
}
void init().catch(() => status.textContent = t('loadError'));
