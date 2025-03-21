import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { Demucs } from '@vox-demucs/Demucs';
import type { DemucsConfig } from '@vox-demucs/DemucsConfig';
import type { Subprocess } from 'bun';

// Save the original Bun.spawn to restore later.
const originalSpawn = Bun.spawn;

describe('Demucs Unit Tests', () => {
    let recordedCmd: string[] = [];

    beforeEach(() => {
        // Override Bun.spawn with a mock that records the command and returns a fake Subprocess.
        Bun.spawn = ((options: { cmd: string[]; stdout: 'pipe'; stderr: 'pipe' }): Subprocess => {
            recordedCmd = options.cmd;

            // Create a fake stdout ReadableStream.
            const fakeStdout = new ReadableStream<Uint8Array>({
                start(controller) {
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode('Test stdout output'));
                    controller.close();
                },
            });

            // Create a fake stderr ReadableStream (empty).
            const fakeStderr = new ReadableStream<Uint8Array>({
                start(controller) {
                    controller.close();
                },
            });

            // Construct a fake Subprocess object with all required properties.
            const fakeProc: Subprocess = {
                stdout: fakeStdout,
                stderr: fakeStderr,
                stdin: undefined,
                readable: fakeStdout,
                exited: Promise.resolve(0),
                pid: 1234,
                exitCode: 0,
                signalCode: null,
                killed: false,
                kill(_signal?: number | NodeJS.Signals): void {
                    /* no-op */
                },
                ref(): void {
                    /* no-op */
                },
                unref(): void {
                    /* no-op */
                },
                send(_message: unknown): void {
                    /* no-op */
                },
                disconnect(): void {
                    /* no-op */
                },
                resourceUsage() {
                    return undefined;
                },
                [Symbol.asyncDispose]: async () => {
                    /* no-op */
                },
            };
            return fakeProc;
        }) as typeof Bun.spawn;
    });

    afterEach(() => {
        // Restore the original Bun.spawn after each test.
        Bun.spawn = originalSpawn;
    });

    test('should throw error if input file is not specified', async () => {
        expect(new Demucs({ input: '', out: 'output-folder' }).run()).rejects.toThrow(
            'Input file not specified in configuration.',
        );
    });

    test('should build correct command for local engine', async () => {
        const config: DemucsConfig = {
            input: 'file.mp3',
            out: 'output-folder',
            device: 'cpu',
            name: 'htdemucs',
            demucsEngine: 'local',
        };
        const demucs = new Demucs(config);
        const output = await demucs.run();

        expect(recordedCmd).toContain('demucs');
        // For local engine mode, our command should NOT include "docker" or volume mounts.
        expect(recordedCmd).not.toContain('docker');
        expect(recordedCmd).toContain('-d');
        expect(recordedCmd).toContain('cpu');
        expect(recordedCmd).toContain('-n');
        expect(recordedCmd).toContain('htdemucs');
        expect(recordedCmd).toContain('file.mp3');

        expect(output).toEqual('Test stdout output');
    });

    test('should build correct command for docker engine', async () => {
        const config: DemucsConfig = {
            input: '/absolute/path/to/file.mp3',
            out: 'output-folder',
            device: 'cpu',
            name: 'mdx_extra_q',
            demucsEngine: 'docker',
        };
        const demucs = new Demucs(config);
        const output = await demucs.run();

        // For docker engine, the command should start with "docker".
        expect(recordedCmd[0]).toEqual('docker');
        // Check that the volume mount is included.
        expect(recordedCmd).toContain('-v');
        // Verify that the "-n" option is followed by "mdx_extra_q".
        const nameIndex = recordedCmd.findIndex((arg) => arg === '-n');
        expect(recordedCmd[nameIndex + 1]).toEqual('mdx_extra_q');
        // The last argument should be the container path (/data/input/<filename>).
        expect(recordedCmd[recordedCmd.length - 1]).toEqual('/data/input/file.mp3');

        expect(output).toEqual('Test stdout output');
    });

    test('should not log output when silent is true', async () => {
        const originalConsoleLog = console.log;
        let logged = false;
        console.log = (..._args: unknown[]) => {
            logged = true;
        };

        const config: DemucsConfig = {
            input: 'file.mp3',
            out: 'output-folder',
            silent: true,
            demucsEngine: 'local',
        };
        const demucs = new Demucs(config);
        await demucs.run();

        expect(logged).toBe(false);
        console.log = originalConsoleLog;
    });
});
