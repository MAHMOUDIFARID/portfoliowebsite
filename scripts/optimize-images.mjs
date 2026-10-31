import sharp from 'sharp';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public', 'optimized');
const manifestPath = path.join(root, 'src', 'data', 'image-manifest.json');
const scriptTime = (await stat(fileURLToPath(import.meta.url))).mtimeMs;
const sources = [
  ['FARID MAHMOUDI.jpg', [64, 128, 384], 128],
  ['logobest.png', [64, 128], 64],
  ['Logo.png', [320, 650], 650],
  ...['mitex.png', 'Marocdesmerveilles.png', 'dadesmgoun.png', 'dartimitar.png',
    'tidyx.png', 'quishing.png', 'bdarija.png', 'service_fullstack.png',
    'service_automation.png', 'service_ai.png'].map(file => [file, [480, 800, 1200], 800]),
];

await mkdir(output, { recursive: true });
await mkdir(path.dirname(manifestPath), { recursive: true });
const manifest = {};
let originalBytes = 0;
let defaultBytes = 0;
for (const [file, requestedWidths, preferredWidth] of sources) {
  const source = path.join(root, 'public', file);
  const sourceStat = await stat(source);
  const metadata = await sharp(source).metadata();
  const widths = [...new Set(requestedWidths.map(width => Math.min(width, metadata.width)))];
  const variants = [];
  for (const width of widths) {
    const name = `${path.parse(file).name.replace(/\s+/g, '-')}-${width}.webp`;
    const target = path.join(output, name);
    const targetStat = await stat(target).catch(() => null);
    if (!targetStat || targetStat.mtimeMs < Math.max(sourceStat.mtimeMs, scriptTime)) {
      await sharp(source).rotate().resize({ width, withoutEnlargement: true })
        .webp({ quality: 84, effort: 5 }).toFile(target);
    }
    variants.push({ width, src: `/optimized/${name}`, bytes: (await stat(target)).size });
  }
  const selected = variants.find(variant => variant.width >= preferredWidth) || variants.at(-1);
  manifest[`/${file}`] = {
    src: selected.src,
    srcSet: variants.map(variant => `${variant.src} ${variant.width}w`).join(', '),
    width: metadata.width,
    height: metadata.height,
  };
  originalBytes += sourceStat.size;
  defaultBytes += selected.bytes;
}
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
if (await readFile(manifestPath, 'utf8').catch(() => '') !== serialized) await writeFile(manifestPath, serialized);
console.log(`Optimized ${sources.length} images: ${(originalBytes / 1e6).toFixed(2)} MB originals -> ${(defaultBytes / 1e6).toFixed(2)} MB default variants.`);
