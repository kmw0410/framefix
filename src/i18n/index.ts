import ko from '../../i18n/ko/messages.json';
import en from '../../i18n/en/messages.json';
import type { Settings } from '../shared/settings';
const messages: Record<string, Record<string, { message: string }>> = { ko, en };
let locale = chrome.i18n.getUILanguage().toLowerCase().startsWith('ko') ? 'ko' : 'en';
export function setLanguage(language: Settings['language']) {
  locale = language === 'auto' ? (chrome.i18n.getUILanguage().toLowerCase().startsWith('ko') ? 'ko' : 'en') : language;
  document.documentElement.lang = locale;
}
export function t(key: string): string { return messages[locale][key]?.message ?? messages.en[key]?.message ?? key; }
