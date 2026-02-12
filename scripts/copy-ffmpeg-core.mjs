import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const srcDir = path.join(repoRoot, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm');
const destDir = path.join(repoRoot, 'public', 'ffmpeg');

const files = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm',
  'ffmpeg-core.worker.js',
];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(srcDir))) {
    console.error(`[ffmpeg] Missing ${srcDir}`);
    console.error('[ffmpeg] Run `npm install` to install @ffmpeg/core.');
    process.exitCode = 1;
    return;
  }

  await fs.mkdir(destDir, { recursive: true });

  let copied = 0;
  for (const name of files) {
    const from = path.join(srcDir, name);
    const to = path.join(destDir, name);

    if (!(await exists(from))) {
      console.error(`[ffmpeg] Missing core asset: ${from}`);
      process.exitCode = 1;
      continue;
    }

    const shouldCopy = !(await exists(to));
    if (shouldCopy) {
      await fs.copyFile(from, to);
      copied++;
    }
  }

  // Keep output low-noise for dev loops.
  if (copied > 0) {
    console.log(`[ffmpeg] Copied ${copied} core asset(s) to public/ffmpeg`);
  }
}

await main();

