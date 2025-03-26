// build.ts

const entrypoints = ['src/index.ts'];
const target = 'node';

// Build ESM
const resultESM = await Bun.build({
    entrypoints,
    target,
    format: 'esm',
    outdir: 'dist',
    naming: {
        entry: 'index.js', // ESM default
    },
});

if (!resultESM.success) {
    console.error('❌ Failed to build ESM modules');
    for (const message of resultESM.logs) {
        console.error(message.message);
    }
    process.exit(1);
}

// Build CJS
const resultCJS = await Bun.build({
    entrypoints,
    target,
    format: 'cjs',
    outdir: 'dist',
    naming: {
        entry: 'index.cjs',
    },
});

if (!resultCJS.success) {
    console.error('❌ Failed to build CJS modules');
    for (const message of resultCJS.logs) {
        console.error(message.message);
    }
    process.exit(1);
}

console.log('✅ Dual build (ESM + CJS) completed successfully!');
