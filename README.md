[![NPM](https://img.shields.io/npm/v/@voxextractlabs/vox-demucs?label=npm)](https://www.npmjs.com/package/@voxextractlabs/vox-demucs)
[![License](https://img.shields.io/npm/l/@voxextractlabs/vox-demucs)](./LICENSE)
[![Build Status](https://github.com/VoxExtract-Labs/vox-demucs/actions/workflows/build-status.yml/badge.svg)](https://github.com/VoxExtract-Labs/vox-demucs/actions/workflows/build-status.yml)
[![Codecov](https://img.shields.io/codecov/c/github/VoxExtract-Labs/vox-demucs?token=TOKEN)](https://app.codecov.io/gh/VoxExtract-Labs/vox-demucs)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/@voxextractlabs/vox-demucs)](https://bundlephobia.com/package/@voxextractlabs/vox-demucs)

# @voxextractlabs/vox-demucs

> A Bun-native wrapper for Facebook’s [Demucs](https://github.com/facebookresearch/demucs) to isolate vocals and instruments from audio tracks. Built for local inference with options for Docker or direct execution.

---

## ✨ Features

- 🎤 Separates vocals and instruments using pre-trained Demucs models
- 🧠 Configurable options for both local and Docker execution
- ⚡ Built on Bun with TypeScript support
- 🧪 Includes unit and integration tests for reliability

---

## 📦 Installation

```bash
bun install @voxextractlabs/vox-demucs
```

or

```bash
npm install @voxextractlabs/vox-demucs
```

---

## 🚀 Usage

### Example with Docker Mode

```ts
import { Demucs } from '@voxextractlabs/vox-demucs'

const demucs = new Demucs({
    input: "path/to/file.mp3",       // Path to your input audio file
    out: "output-folder",            // Directory where separated tracks will be saved
    device: "cpu",                   // Device to run on (e.g., "cpu" or "cuda")
    demucsEngine: "docker",          // Execution mode: "docker" or "local"
    dockerImage: "voxextractlabs/vox-demucs:1.0.0" // Optional custom Docker image
})

const results = await demucs.run()
console.log('Separation complete:', results)
```

### Example with Local Execution

```ts
import { Demucs } from '@voxextractlabs/vox-demucs'

const demucs = new Demucs({
    input: "path/to/file.mp3",
    out: "output-folder",
    device: "cpu",
    demucsEngine: "local"           // Run Demucs directly on your machine
})

const results = await demucs.run()
console.log('Separation complete:', results)
```

---

## ⚙️ Configuration

The `Demucs` class accepts a configuration object (`DemucsConfig`) with the following properties:

```ts
interface DemucsConfig {
    input: string            // Required: Path to the input audio file.
    out: string              // Required: Output folder for separated tracks.
    help?: boolean           // Display help message.
    sig?: string             // Signature parameter for advanced usage.
    name?: string            // Name to be used in processing.
    repo?: string            // Repository URL reference.
    verbose?: boolean        // Enable verbose logging.
    filename?: string        // Custom output filename.
    device?: string          // "cpu" or "cuda", etc.
    shifts?: number          // Number of shifts to perform.
    overlap?: number         // Overlap value for processing.
    noSplit?: boolean        // Disable splitting if true.
    segment?: number         // Segment length.
    twoStems?: string        // Option for two stems separation.
    int24?: boolean          // Use 24-bit integer processing.
    float32?: boolean        // Use 32-bit float processing.
    clipMode?: 'rescale' | 'clamp'  // Clipping mode.
    flac?: boolean           // Output in FLAC format if true.
    mp3?: boolean            // Output in MP3 format if true.
    mp3Bitrate?: number      // Bitrate for MP3 output.
    mp3Preset?: number       // Preset quality for MP3.
    jobs?: number            // Number of parallel jobs.
    silent?: boolean         // If true, suppresses automatic logging.
    demucsEngine?: 'docker' | 'local' // Choose the execution mode.
    dockerImage?: string     // Optional: Custom Docker image for execution.
}
```

> Note: Only `input` and `out` are required; the rest are optional based on your needs.

---

## 💠 Python Environment Setup

To run Demucs locally (outside of Docker), ensure you have a Python environment set up. Use the helper script:

```bash
./scripts/setup-venv.sh
```

This creates a virtual environment in `./env` and installs dependencies from `requirements.txt`.

---

## 🧪 Running Tests

```bash
bun test
```

- **Unit tests**: Located in `tests/Demucs.unit.test.ts`
- **Integration tests**: Located in `tests/Demucs.integration.test.ts`

---

## 📂 Project Structure

```
src/               → Core source code (Demucs.ts, DemucsConfig.ts, index.ts)
tests/             → Unit and integration tests
scripts/           → Setup helpers (e.g., Python venv setup)
tmp/               → Temporary and output files (excluded from publish)
```

---

## 📟 License

MIT © 2025 [VoxExtract Labs](https://github.com/VoxExtract-Labs)

