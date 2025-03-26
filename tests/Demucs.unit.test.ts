// tests/Demucs.unit.test.ts

import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';

import { resolve } from 'node:path';
import { Demucs } from '@vox-demucs/Demucs';
import type { DemucsConfig } from '@vox-demucs/DemucsConfig';

describe('Demucs Unit Tests (with mocked spawn)', async () => {
    const mockedExecuteCommand = async (cmd: string[]) => ({
        stdout: cmd.join(' '),
        stderr: '',
        exitCode: 0,
    });

    test('throws error if input file not specified', async () => {
        expect(new Demucs({ input: '', out: 'output-folder' }).run()).rejects.toThrow(
            'Input file not specified in configuration.',
        );
    });

    test('builds correct command for local engine', async () => {
        const config: DemucsConfig = {
            input: 'track.mp3',
            out: 'out',
            device: 'cpu',
            demucsEngine: 'local',
        };
        const demucs = new Demucs(config);
        spyOn(demucs, 'executeCommand').mockImplementation(mockedExecuteCommand);
        const recordedCmd = await demucs.run();

        expect(recordedCmd).toContain('demucs');
        expect(recordedCmd).toContain('track.mp3');
        expect(recordedCmd).not.toContain('docker');
    });

    test('builds correct command for docker engine', async () => {
        const config: DemucsConfig = {
            input: '/audio/song.mp3',
            out: 'out',
            demucsEngine: 'docker',
            device: 'cuda',
            name: 'mdx_extra',
        };
        const demucs = new Demucs(config);
        spyOn(demucs, 'executeCommand').mockImplementation(mockedExecuteCommand);
        const recordedCmd = await demucs.run();

        expect(recordedCmd.startsWith('docker')).toBeTrue();
        expect(recordedCmd).toContain('--gpus');
        expect(recordedCmd).toContain('all');
        expect(recordedCmd).toContain('/data/input/song.mp3');
        expect(recordedCmd).toContain(`-v ${resolve(config.out)}:/app/output`);
    });
});
