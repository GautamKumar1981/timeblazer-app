import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(__dirname, 'public', 'icon-512.svg'));

const sizes = [512, 192, 180, 152, 144, 128, 96, 72];

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(__dirname, 'public', `icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}
