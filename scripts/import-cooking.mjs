// Import representative photos exported from the browser's pageAssets bundle.
// Input rows: shortcode|source filename prefix|caption|optional reel
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [snapshotPath, ...bundleDirectories] = process.argv.slice(2);
if (!snapshotPath || !bundleDirectories.length) {
  throw new Error('Usage: node scripts/import-cooking.mjs snapshot.tsv bundle-directory ...');
}
const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(root, 'src/data/cooking.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const importedOn = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
const posts = new Map(manifest.posts.map((post) => [post.shortcode, post]));
const assets = bundleDirectories.flatMap((directory) =>
  JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8')).assets
);
const rows = fs.readFileSync(snapshotPath, 'utf8').trim().split('\n');
let added = 0;
for (const row of rows) {
  const [shortcode, prefix, caption, kind = 'p'] = row.split('|');
  if (!/^[A-Za-z0-9_-]+$/.test(shortcode)) throw new Error('Invalid shortcode');
  const existing = posts.get(shortcode);
  if (existing && fs.existsSync(path.join(root, 'src', existing.image))) continue;
  const asset = assets.find((asset) => asset.name.startsWith(`${prefix}_`));
  if (!asset) throw new Error(`Missing downloaded image for ${shortcode}`);
  const image = existing?.image ?? `assets/cook/${shortcode}.jpg`;
  const destination = path.join(root, 'src', image);
  fs.copyFileSync(asset.path, destination);
  execFileSync('sips', ['-Z', '420', destination], { stdio: 'ignore' });
  posts.set(shortcode, {
    shortcode, caption,
    permalink: `https://www.instagram.com/${kind}/${shortcode}/`,
    image,
    sourceMediaFilename: asset.name,
    importedOn,
  });
  added++;
}
// Shortcodes encode increasing media identifiers in Instagram's Base64 alphabet.
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const mediaId = (code) => [...code].reduce((id, char) => id * 64n + BigInt(alphabet.indexOf(char)), 0n);
manifest.posts = [...posts.values()].sort((a, b) => mediaId(a.shortcode) > mediaId(b.shortcode) ? -1 : 1);
manifest.lastImportedOn = importedOn;
for (const post of manifest.posts) post.importedOn ??= importedOn;
if (new Set(manifest.posts.map((post) => post.image)).size !== manifest.posts.length) throw new Error('Duplicate images');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Imported ${added}; ${manifest.posts.length} unique posts total.`);
