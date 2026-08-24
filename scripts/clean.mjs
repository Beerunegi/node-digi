/**
 * Removes Next.js build output.
 *
 * Run this whenever the dev server reports "Cannot find module './NNNN.js'"
 * or "__webpack_modules__[moduleId] is not a function" -- both mean `.next`
 * holds chunks from a different build. Deleting it is always safe; the next
 * `npm run dev` or `npm run build` regenerates everything.
 */
import { rm } from 'node:fs/promises';

const targets = ['.next', '.next-verify'];

for (const dir of targets) {
  await rm(dir, { recursive: true, force: true });
  console.log(`removed ${dir}`);
}

console.log('\nDone. Run `npm run dev` to rebuild.');
