import esbuild from 'esbuild';
import fse from 'fs-extra';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { performance } from 'perf_hooks';

const { emptyDir, readJson } = fse;

const startTime = performance.now();
const pkg = await readJson('./package.json');
const tsConfig = await readJson('./tsconfig.json');

console.log(`⚡ Building howler.js v${pkg.version}...`);

const outDir = './dist';
const distDir = resolve(outDir);

await emptyDir(distDir);

esbuild
  .build({
    entryPoints: ['src/core.ts'],
    outdir: outDir,
    bundle: true,
    sourcemap: false,
    minify: false,
    splitting: false,
    format: 'esm',
    target: [tsConfig.compilerOptions.target],
    platform: 'browser',
    external: [],
  })
  .then(async () => {
    // Build declaration files with TSC since they aren't built by esbuild.
    execSync('npx tsc');

    const buildTime = ((performance.now() - startTime) / 1000).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      },
    );
    console.log(`✅ Finished in ${buildTime} s\n`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
