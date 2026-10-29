import { cp, readFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MOROCCO SAHARA TREKKING');
const destination = path.join(root, 'dist', 'marocsaharatrekking');

async function removeGenerated(directory) {
  const relative = path.relative(root, path.resolve(directory));
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to remove a directory outside the workspace: ${directory}`);
  }
  await rm(directory, { recursive: true, force: true });
}

console.log('Building trekking website at /marocsaharatrekking/ ...');
for (const script of ['build-cpanel.cjs', 'check-cpanel.cjs']) {
  await new Promise((resolve, reject) => {
    const build = spawn(process.execPath, [path.join(source, 'scripts', script)], {
      cwd: source,
      env: { ...process.env, CPANEL_BASE_PATH: '/marocsaharatrekking', NEXT_TELEMETRY_DISABLED: '1' },
      stdio: 'inherit',
    });
    build.once('error', reject);
    build.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`Trekking ${script} failed (${code}).`)));
  });
}

const { out } = JSON.parse(await readFile(path.join(source, 'build', 'cpanel-latest.json'), 'utf8'));
await removeGenerated(destination);
await cp(out, destination, { recursive: true });

const html = await readFile(path.join(destination, 'index.html'), 'utf8');
if (!html.includes('/marocsaharatrekking/_next/') || !html.includes('/marocsaharatrekking/place1.webp')) {
  throw new Error('The static export is missing the trekking URL prefix.');
}
console.log('Trekking website ready in dist/marocsaharatrekking/');
