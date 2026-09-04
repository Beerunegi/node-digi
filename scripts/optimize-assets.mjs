// Asset optimization: minifies CSS and converts images to WebP.
// Usage:  node scripts/optimize-assets.mjs
// Outputs:
//   public/css/style.min.css   – minified CSS
//   public/images/ (webp)      – WebP copies of every JPG/PNG

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import CleanCSS from 'clean-css';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

// ── CSS Minification ────────────────────────────────────────────────────────
const cssSource = join(ROOT, 'public/css/style.css');
const cssDest = join(ROOT, 'public/css/style.min.css');

const raw = readFileSync(cssSource, 'utf8');
const result = new CleanCSS({ level: 2 }).minify(raw);

if (result.errors.length) {
  console.error('CSS minification errors:', result.errors);
  process.exit(1);
}

writeFileSync(cssDest, result.styles, 'utf8');
const savedKB = ((raw.length - result.styles.length) / 1024).toFixed(1);
console.log(`✓ CSS minified: ${(raw.length / 1024).toFixed(1)} KB → ${(result.styles.length / 1024).toFixed(1)} KB (saved ${savedKB} KB)`);

// ── Image → WebP conversion ────────────────────────────────────────────────
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('⚠ sharp not available — skipping WebP conversion');
  process.exit(0);
}

const IMG_DIRS = [
  join(ROOT, 'public/images'),
  join(ROOT, 'public/images/home'),
  join(ROOT, 'public/images/services'),
];

let converted = 0;

for (const dir of IMG_DIRS) {
  if (!existsSync(dir)) continue;

  const files = readdirSync(dir);
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const src = join(dir, file);
    const stat = statSync(src);
    if (!stat.isFile()) continue;

    const dest = join(dir, basename(file, ext) + '.webp');
    if (existsSync(dest)) continue;

    try {
      await sharp(src).webp({ quality: 80 }).toFile(dest);
      const destStat = statSync(dest);
      const pctSaved = ((1 - destStat.size / stat.size) * 100).toFixed(0);
      console.log(`  WebP: ${file} → ${basename(dest)} (${pctSaved}% smaller)`);
      converted++;
    } catch (err) {
      console.warn(`  ⚠ Failed ${file}: ${err.message}`);
    }
  }
}

console.log(`✓ ${converted} image(s) converted to WebP`);
