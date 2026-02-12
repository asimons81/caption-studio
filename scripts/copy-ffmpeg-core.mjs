import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const repoRoot = process.cwd();
const destDir = path.join(repoRoot, 'public', 'ffmpeg');

const CANDIDATES = {
  coreJs: [
    'dist/esm/ffmpeg-core.js',
    'dist/umd/ffmpeg-core.js',
    'dist/ffmpeg-core.js',
  ],
  coreWasm: [
    'dist/esm/ffmpeg-core.wasm',
    'dist/umd/ffmpeg-core.wasm',
    'dist/ffmpeg-core.wasm',
  ],
  worker: [
    'dist/esm/ffmpeg-core.worker.js',
    'dist/esm/ffmpeg-core.worker.min.js',
    'dist/esm/ffmpeg-core.worker.mjs',
    'dist/umd/ffmpeg-core.worker.js',
    'dist/umd/ffmpeg-core.worker.min.js',
    'dist/umd/ffmpeg-core.worker.mjs',
    'dist/ffmpeg-core.worker.js',
    'dist/ffmpeg-core.worker.min.js',
    'dist/ffmpeg-core.worker.mjs',
  ],
};

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findFirst(baseDir, relPaths) {
  for (const rel of relPaths) {
    const candidate = path.join(baseDir, rel);
    if (await exists(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function findWorkerFallback(baseDir) {
  const distDir = path.join(baseDir, 'dist');
  if (!(await exists(distDir))) return null;

  const queue = [distDir];
  const seen = new Set();
  const workerRegex = /ffmpeg-core.*worker.*\.(js|mjs)$/i;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);

    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(fullPath);
        continue;
      }

      if (entry.isFile() && workerRegex.test(entry.name)) {
        return fullPath;
      }
    }
  }

  return null;
}

function relFromRepo(filePath) {
  return path.relative(repoRoot, filePath).replace(/\\/g, '/');
}

async function resolveCoreBaseDir() {
  // Preferred path when package.json is exportable.
  try {
    const packageJsonPath = require.resolve('@ffmpeg/core/package.json');
    return {
      baseDir: path.dirname(packageJsonPath),
      packageJsonPath,
      via: 'package-json',
    };
  } catch {
    // Fall through to entrypoint resolution.
  }

  try {
    const entryPath = require.resolve('@ffmpeg/core');
    let current = path.dirname(entryPath);

    for (let i = 0; i < 8; i++) {
      const maybePackageJson = path.join(current, 'package.json');
      if (await exists(maybePackageJson)) {
        try {
          const raw = await fs.readFile(maybePackageJson, 'utf8');
          const pkg = JSON.parse(raw);
          if (pkg?.name === '@ffmpeg/core') {
            return {
              baseDir: current,
              packageJsonPath: maybePackageJson,
              via: 'entrypoint-walk',
            };
          }
        } catch {
          // continue walking upward
        }
      }

      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  } catch {
    // no-op
  }

  return null;
}

async function copyAsset(src, destName) {
  const dest = path.join(destDir, destName);
  await fs.copyFile(src, dest);
  return dest;
}

async function main() {
  const strict = process.argv.includes('--strict');
  const mode = strict ? 'strict' : 'normal';
  console.log(`[ffmpeg] Copy mode: ${mode}`);

  const coreResolution = await resolveCoreBaseDir();
  if (!coreResolution) {
    console.error('[ffmpeg] Could not resolve @ffmpeg/core/package.json.');
    console.error('[ffmpeg] Make sure @ffmpeg/core is installed and not pruned by your package manager.');
    process.exitCode = 1;
    return;
  }

  const coreBaseDir = coreResolution.baseDir;
  const corePackageJsonPath = coreResolution.packageJsonPath;
  await fs.mkdir(destDir, { recursive: true });

  const foundCoreJs = await findFirst(coreBaseDir, CANDIDATES.coreJs);
  const foundCoreWasm = await findFirst(coreBaseDir, CANDIDATES.coreWasm);
  let foundWorker = await findFirst(coreBaseDir, CANDIDATES.worker);
  if (!foundWorker) {
    foundWorker = await findWorkerFallback(coreBaseDir);
  }

  const copied = [];
  if (foundCoreJs) {
    copied.push({
      type: 'core-js',
      source: foundCoreJs,
      output: await copyAsset(foundCoreJs, 'ffmpeg-core.js'),
    });
  }
  if (foundCoreWasm) {
    copied.push({
      type: 'core-wasm',
      source: foundCoreWasm,
      output: await copyAsset(foundCoreWasm, 'ffmpeg-core.wasm'),
    });
  }
  if (foundWorker) {
    copied.push({
      type: 'worker',
      source: foundWorker,
      output: await copyAsset(foundWorker, 'ffmpeg-core.worker.js'),
    });
  }

  console.log('[ffmpeg] Asset copy summary:');
  console.log(`[ffmpeg] - package (${coreResolution.via}): ${relFromRepo(corePackageJsonPath)}`);
  for (const item of copied) {
    console.log(`[ffmpeg] - ${item.type}: ${relFromRepo(item.source)} -> ${relFromRepo(item.output)}`);
  }

  if (!foundWorker) {
    console.warn('[ffmpeg] Worker asset not found in @ffmpeg/core package layout. Continuing without ffmpeg-core.worker.js.');
  }

  const missingRequired = [];
  if (!foundCoreJs) missingRequired.push('ffmpeg-core.js');
  if (!foundCoreWasm) missingRequired.push('ffmpeg-core.wasm');

  if (missingRequired.length > 0) {
    console.error(`[ffmpeg] Missing required core asset(s): ${missingRequired.join(', ')}`);
    console.error('[ffmpeg] Searched under @ffmpeg/core package with candidate layouts:');
    for (const p of CANDIDATES.coreJs) console.error(`[ffmpeg] - ${p}`);
    for (const p of CANDIDATES.coreWasm) console.error(`[ffmpeg] - ${p}`);
    console.error('[ffmpeg] Try pinning a compatible @ffmpeg/core version or inspect node_modules/@ffmpeg/core/dist.');
    process.exitCode = 1;
    return;
  }

  console.log('[ffmpeg] Required assets are available in public/ffmpeg.');
}

await main();
