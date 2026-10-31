import { readFile, writeFile } from 'node:fs/promises';
const version = process.env.BUILD_VERSION;
if (!version || !/^\d+\.\d+\.\d+\.\d+$/.test(version) || version.split('.').some(part => Number(part) > 65535 || String(Number(part)) !== part)) {
  throw new Error('BUILD_VERSION must contain four integers between 0 and 65535, without leading zeros');
}
for (const file of ['package.json', 'package-lock.json']) {
  const data = JSON.parse(await readFile(file, 'utf8'));
  data.version = version;
  if (file === 'package-lock.json') data.packages[''].version = version;
  await writeFile(file, JSON.stringify(data, null, 2) + '\n');
}
console.log(`Release version: ${version}`);
