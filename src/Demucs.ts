import { spawn } from 'node:child_process';
import { basename, dirname, resolve } from 'node:path';
import { DEFAULT_CONFIG, type DemucsConfig } from '@vox-demucs/DemucsConfig';

/**
 * The Demucs class allows you to run Demucs via child_process.spawn with a chainable API.
 *
 * Usage examples:
 *
 *   // Using static init with overrides (input file, out folder, and optional docker image must be provided)
 *   const results = await Demucs.init({
 *     input: "path/to/file.mp3",
 *     out: "output-folder",
 *     device: "cpu",
 *     demucsEngine: "docker",         // or "local"
 *     dockerImage: "voxextractlabs/vox-demucs:1.0.0" // optional
 *   }).run();
 *
 *   // Or, using the constructor directly:
 *   const demucs = new Demucs({
 *     input: "path/to/file.mp3",
 *     out: "output-folder",
 *     device: "cpu",
 *     demucsEngine: "local" // or "docker"
 *   });
 *   const results = await demucs.run();
 */
export class Demucs {
    private config: DemucsConfig;

    constructor(overrides: DemucsConfig) {
        // Merge DEFAULT_CONFIG into overrides. 'input' and 'out' must be provided.
        this.config = { ...DEFAULT_CONFIG, ...overrides } as DemucsConfig;
    }

    /**
     * Static initializer.
     */
    static init(overrides: DemucsConfig): Demucs {
        return new Demucs(overrides);
    }

    /**
     * Runs Demucs with the current configuration.
     *
     * This method builds the CLI arguments based on the configuration,
     * spawns the process using Node.js `child_process.spawn`, and returns the output.
     *
     * For Docker mode, it converts the input file path to an absolute path,
     * mounts the file directory, and rewrites the input argument accordingly.
     *
     * When `silent` is false, stdout and stderr are streamed in real time.
     *
     * @returns A promise that resolves with the combined stdout and stderr output.
     */
    async run(): Promise<string> {
        let inputFilePath = this.config.input;
        if (!inputFilePath || inputFilePath.trim() === '') {
            throw new Error('Input file not specified in configuration.');
        }

        // Resolve absolute path for Docker engine
        if (this.config.demucsEngine === 'docker') {
            inputFilePath = resolve(inputFilePath);
        }

        // Build CLI arguments from config
        const args: string[] = [];
        if (this.config.help) {
            args.push('--help');
        }
        if (this.config.sig) {
            args.push('-s', this.config.sig);
        }
        if (this.config.name) {
            args.push('-n', this.config.name);
        }
        if (this.config.repo) {
            args.push('--repo', this.config.repo);
        }
        if (this.config.verbose) {
            args.push('-v');
        }
        if (this.config.out) {
            args.push('-o', this.config.out);
        }
        if (this.config.filename) {
            args.push('--filename', this.config.filename);
        }
        if (this.config.device) {
            args.push('-d', this.config.device);
        }
        if (this.config.shifts !== undefined) {
            args.push('--shifts', String(this.config.shifts));
        }
        if (this.config.overlap !== undefined) {
            args.push('--overlap', String(this.config.overlap));
        }
        if (this.config.noSplit) {
            args.push('--no-split');
        }
        if (this.config.segment !== undefined) {
            args.push('--segment', String(this.config.segment));
        }
        if (this.config.twoStems) {
            args.push('--two-stems', this.config.twoStems);
        }
        if (this.config.int24) {
            args.push('--int24');
        }
        if (this.config.float32) {
            args.push('--float32');
        }
        if (this.config.clipMode) {
            args.push('--clip-mode', this.config.clipMode);
        }
        if (this.config.flac) {
            args.push('--flac');
        }
        if (this.config.mp3) {
            args.push('--mp3');
        }
        if (this.config.mp3Bitrate !== undefined) {
            args.push('--mp3-bitrate', String(this.config.mp3Bitrate));
        }
        if (this.config.mp3Preset !== undefined) {
            args.push('--mp3-preset', String(this.config.mp3Preset));
        }
        if (this.config.jobs !== undefined) {
            args.push('-j', String(this.config.jobs));
        }

        args.push(inputFilePath);

        let cmd: string[];
        if (this.config.demucsEngine === 'docker') {
            const inputDir = dirname(inputFilePath);
            const fileName = basename(inputFilePath);
            const dockerImage = this.config.dockerImage || 'vox-demucs:ubuntu';
            cmd = [
                'docker',
                'run',
                '--rm',
                ...(this.config.device === 'cuda' ? ['--gpus', 'all'] : []),
                '-w',
                '/app',
                '-v',
                `${inputDir}:/data/input`,
                dockerImage,
                'demucs',
                ...args.slice(0, -1),
                `/data/input/${fileName}`,
            ];
        } else {
            cmd = ['demucs', ...args];
        }

        if (!this.config.silent) {
            console.log('Executing command:', cmd.join(' '));
        }

        return new Promise((resolve, reject) => {
            const proc = spawn(cmd[0], cmd.slice(1), {
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (chunk) => {
                const text = chunk.toString();
                stdout += text;
                if (!this.config.silent) {
                    process.stdout.write(text);
                }
            });

            proc.stderr.on('data', (chunk) => {
                const text = chunk.toString();
                stderr += text;
                if (!this.config.silent) {
                    process.stderr.write(text);
                }
            });

            proc.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Demucs process failed with exit code ${code}:${stderr}`));
                } else {
                    resolve(stdout + stderr);
                }
            });
        });
    }
}
