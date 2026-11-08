"""Build release archives from an explicit file list; never include local credentials."""
import hashlib
import json
import re
import shutil
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent.parent
version = json.loads((ROOT / 'package.json').read_text())['version']
if not re.fullmatch(r'\d+\.\d+\.\d+(?:\.\d+)?', version):
    raise SystemExit('Use a numeric x.y.z or x.y.z.n version in package.json')

out = ROOT / 'release'
if out.exists():
    shutil.rmtree(out)
out.mkdir()

def archive(destination, base, paths):
    with ZipFile(destination, 'w', compression=ZIP_DEFLATED) as z:
        for path in sorted(paths):
            info = ZipInfo(path.relative_to(base).as_posix(), date_time=(2020, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, path.read_bytes())

base = ROOT / 'dist' / 'chrome'
manifest = json.loads((base / 'manifest.json').read_text())
if manifest['version'] != version:
    raise SystemExit('Chrome manifest version mismatch; rebuild first')
files = [base / name for name in ['manifest.json', 'popup.html', 'popup.css', 'popup.js', 'content.js', 'player.js', 'chzzk.js']]
files += list((base / '_locales').glob('*/messages.json'))
files += list((base / 'icons').glob('*.png'))
for mapping in [manifest['icons'], manifest['action']['default_icon']]:
    for filename in mapping.values():
        if not (base / filename).is_file():
            raise SystemExit(f'Missing icon: {filename}')
archive(out / f'framefix-{version}-chrome.zip', base, files)

source = [ROOT / name for name in ['package.json', 'package-lock.json', 'tsconfig.json', 'README.md', 'README_ko.md', '.gitignore']]
for directory in ['src', 'i18n', 'manifests', 'public', 'scripts', 'tests', 'docs', '.github']:
    source += [p for p in (ROOT / directory).rglob('*') if p.is_file() and '__pycache__' not in p.parts]
if (ROOT / 'LICENSE').is_file():
    source.append(ROOT / 'LICENSE')
archive(out / f'framefix-{version}-source.zip', ROOT, source)
(out / 'RELEASE-NOTES.md').write_text(f'''FrameFix {version} — release

- Chrome: download `framefix-{version}-chrome.zip`, extract it, then use **Load unpacked** in `chrome://extensions` with Developer mode enabled.
- Source: `framefix-{version}-source.zip`; build with Node.js 24 and `npm ci && npm run build`.
- Integrity: compare downloaded files with `SHA256SUMS.txt`.

These are GitHub release downloads, not Chrome Web Store listings. Updates require manual installation. Actual YouTube/Premium end-to-end verification is still pending; Premium selection depends on identifiers exposed by the player.
''')
files = sorted(p for p in out.iterdir() if p.is_file())
(out / 'SHA256SUMS.txt').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in files))
print(f'Packaged version {version}: ' + ', '.join(p.name for p in out.iterdir()))
