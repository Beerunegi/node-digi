/**
 * Runs a production build into `.next-verify` instead of `.next`.
 *
 * A build and a dev server cannot share an output directory: the build
 * replaces the chunks the running dev server has already loaded, and the
 * server then throws "Cannot find module './NNNN.js'" from webpack-runtime.
 * Use this when you want to check that a change compiles while `npm run dev`
 * is still running.
 *
 * Plain `npm run build` is unchanged and still writes to `.next`.
 */
import { spawn } from 'node:child_process';

const child = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: '.next-verify' },
});

child.on('exit', (code) => process.exit(code ?? 1));
