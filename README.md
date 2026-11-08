# FrameFix

A Chrome extension that keeps YouTube videos at your preferred quality.

[한국어](./README_ko.md) | English

## Features

- Playback quality selection from 144p to 4320p
- Quality selection for standard videos and Shorts
- Enhanced bitrate toggle (OFF by default; **requires a YouTube Premium account**)
- Automatic (system), light, and dark themes
- Korean and English support
- Automatic settings saving, with export and import support

## Installation

This extension is not listed on the Chrome Web Store.

1. Download `framefix-<version>-chrome.zip` from GitHub **Releases** and extract it.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Refresh any open YouTube pages after installation.

## Directory Structure

- `src/popup`: Settings UI and CSS themes that respond to system color scheme changes
- `src/content`: Settings communication between extension storage and the page
- `src/player`: Player controls and retry logic
- `src/shared`: Settings validation and quality selection policy
- `i18n/ko`, `i18n/en`: Translation sources, copied to `_locales` during the build
- `manifests`: Browser-specific configuration
- `tests`: Quality policy and settings validation tests

## Settings Backup

Use **Export settings** at the bottom of the popup to save `framefix-settings.json`, and **Import settings** to transfer settings between Chrome browsers or devices. The file includes `app: "framefix"`, format `version: 2`, and settings for ON/OFF, quality, bitrate preference, theme, and language. Importing replaces all existing settings and applies them immediately after a successful save. Invalid formats or values, unsupported versions, and files larger than 64 KB leave existing settings unchanged. No additional permissions or external data transfers are required.

## Interface Language

Choose **Auto / 한국어 / English** in the popup. Auto follows the browser language, using English for languages other than Korean. Changes apply immediately throughout the popup and are saved locally. JSON backups also include the language preference; older backups without a language field default to Auto. The extension name and description in the extension manager follow the browser's built-in localization rules.

The legacy `quality: "auto"` setting in local storage and version 1 backups is migrated to OFF with 1080p selected. When the previous quality cannot be recovered, 1080p is used as the default. Existing settings with other quality values remain ON. Version 1 backups can still be imported.

## License

MIT

## Disclaimer

FrameFix is an independent third-party extension and is not affiliated with YouTube, Google, CHZZK, or NAVER.
