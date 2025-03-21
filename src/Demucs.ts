import { basename, dirname, resolve } from 'node:path';
import { DEFAULT_CONFIG, type DemucsConfig } from '@vox-demucs/DemucsConfig';

/**
 * The Demucs class allows you to run Demucs via Bun.spawn with a chainable API.
 *
 * Usage examples:
 *
 *   // Using static init with overrides (input file, out folder, and optional docker image must be provided)
 *   const results = await Demucs.init({
 *     input: "path/to/file.mp3",
 *     out: "output-folder",
 *     device: "cpu",
 *     demucsEngine: "docker",         // or "local"
 *     dockerImage: "voxextractlabs/vox-demucs:cuda12.4.1-ubuntu22.04-demucs4.0.1" // optional
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
     * spawns the process using Bun.spawn, and returns the stdout output.
     *
     * For Docker mode, it converts the input file path to an absolute path,
     * extracts its directory and basename, and mounts that directory into the container,
     * replacing the input argument with the container path.
     *
     * When `silent` is false, the stdout and stderr streams are streamed and logged as they arrive.
     *
     * @returns A promise that resolves with the combined stdout and stderr output.
     */
    async run(): Promise<string> {
        // Get the input file from the configuration.
        let inputFilePath = this.config.input;
        if (!inputFilePath || inputFilePath.trim() === '') {
            throw new Error('Input file not specified in configuration.');
        }

        // For Docker mode, resolve the input file to an absolute path.
        if (this.config.demucsEngine === 'docker') {
            inputFilePath = resolve(inputFilePath);
        }

        // Build CLI arguments from the base configuration.
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

        // Append the input file as the track argument.
        args.push(inputFilePath);

        let cmd: string[];
        if (this.config.demucsEngine === 'docker') {
            // For Docker mode, mount the directory containing the input file.
            const inputDir = dirname(inputFilePath);
            const fileName = basename(inputFilePath);
            // Use the dockerImage from the config if provided, otherwise default to "vox-demucs:ubuntu".
            const dockerImage = this.config.dockerImage || 'vox-demucs:ubuntu';
            cmd = [
                'docker',
                'run',
                '--rm',
                // Conditionally add GPU support if device is cuda:
                ...(this.config.device === 'cuda' ? ['--gpus', 'all'] : []),
                '-w',
                '/app',
                '-v',
                `${inputDir}:/data/input`,
                dockerImage,
                'demucs',
                ...args.slice(0, args.length - 1),
                // Replace the input file argument with the container path.
                `/data/input/${fileName}`,
            ];
        } else {
            // Local execution: run demucs with the arguments exactly as provided.
            cmd = ['demucs', ...args];
        }

        // If not silent, log the generated command.
        if (!this.config.silent) {
            console.log('Executing command:', cmd.join(' '));
        }

        // Spawn the Demucs process using Bun.spawn.
        const proc = Bun.spawn({
            cmd,
            stdout: 'pipe',
            stderr: 'pipe',
        });

        // We'll stream the output if silent is false.
        const decoder = new TextDecoder();
        let stdoutOutput = '';
        let stderrOutput = '';

        if (!this.config.silent) {
            const stdoutReader = proc.stdout.getReader();
            const stderrReader = proc.stderr.getReader();
            const stdoutPromise = (async () => {
                let result = '';
                while (true) {
                    const { done, value } = await stdoutReader.read();
                    if (done) {
                        break;
                    }
                    const chunk = decoder.decode(value);
                    result += chunk;
                    console.log(chunk);
                }
                return result;
            })();
            const stderrPromise = (async () => {
                let result = '';
                while (true) {
                    const { done, value } = await stderrReader.read();
                    if (done) {
                        break;
                    }
                    const chunk = decoder.decode(value);
                    result += chunk;
                    console.error(chunk);
                }
                return result;
            })();
            const [stdoutText, stderrText, exitCode] = await Promise.all([stdoutPromise, stderrPromise, proc.exited]);
            stdoutOutput = stdoutText;
            stderrOutput = stderrText;
            if (exitCode !== 0) {
                throw new Error(`Demucs process failed with exit code ${exitCode}:\n${stderrOutput}`);
            }
        } else {
            // If silent, buffer the outputs.
            stdoutOutput = await new Response(proc.stdout).text();
            stderrOutput = await new Response(proc.stderr).text();
            const exitCode = await proc.exited;
            if (exitCode !== 0) {
                throw new Error(`Demucs process failed with exit code ${exitCode}:\n${stderrOutput}`);
            }
        }

        return stdoutOutput + stderrOutput;
    }
}
