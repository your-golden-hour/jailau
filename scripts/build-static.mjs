import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const assets = [
  'index.html', 'icon.svg', 'manifest.webmanifest', 'service-worker.js', '_headers',
  'css', 'fonts', 'icons', 'js', 'vendor/supabase-js'
];

mkdirSync(output, { recursive: true });
for (const asset of assets) {
  const destination = join(output, asset);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(join(root, asset), destination, { recursive: true, force: true });
}

console.log(`Prepared ${assets.length} public asset groups in dist/`);
