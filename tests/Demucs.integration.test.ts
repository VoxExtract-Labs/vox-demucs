import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Demucs } from '@vox-demucs/Demucs';

// Use a test file at "./tests/test.mp3"
const testAudioFile = './tests/test.mp3';

// Increase timeout to 20 seconds for each integration test.
const TIMEOUT = 90000;

describe('Integration tests for Demucs', () => {
    test(
        'should have a valid test audio file',
        () => {
            expect(existsSync(testAudioFile)).toBe(true);
        },
        TIMEOUT,
    );

    test(
        'should run Demucs locally and produce output',
        async () => {
            const demucs = new Demucs({
                input: testAudioFile,
                out: './tmp',
                device: 'cpu',
                demucsEngine: 'local',
            });
            const output = await demucs.run();
            expect(output).toContain('Separating track');
        },
        TIMEOUT,
    );

    test(
        'should run Demucs via Docker and produce output',
        async () => {
            // For Docker mode, supply an absolute path for the input file.
            const absoluteTestFile = resolve(testAudioFile);
            const demucs = new Demucs({
                input: absoluteTestFile,
                out: './tmp',
                device: 'cpu',
                demucsEngine: 'docker',
                silent: true,
            });
            const output = await demucs.run();
            expect(output).toContain('Separating track');
        },
        TIMEOUT,
    );
});
