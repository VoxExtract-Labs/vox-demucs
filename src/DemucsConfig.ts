/**
 * Base CLI options available for Demucs.
 *
 * These options correspond to the command-line flags that Demucs accepts:
 *
 * - `-h, --help`: Show this help message and exit.
 * - `-s SIG, --sig SIG`: Locally trained XP signature.
 * - `-n NAME, --name NAME`: Pretrained model name or signature. Default is "htdemucs".
 * - `--repo REPO`: Folder containing all pre-trained models for use with `-n`.
 * - `-v, --verbose`: Enable verbose output.
 * - `-o OUT, --out OUT`: Folder where extracted tracks are saved. A subfolder with the model name will be created.
 * - `--filename FILENAME`: Set the name of the output file. Use "{track}", "{trackext}", "{stem}", "{ext}" to refer to variables of the track name.
 *   Default is "{track}/{stem}.{ext}".
 * - `-d DEVICE, --device DEVICE`: Device to use. Default is "cuda" if available, else "cpu".
 * - `--shifts SHIFTS`: Number of random shifts for equivariant stabilization.
 * - `--overlap OVERLAP`: Overlap between the splits.
 * - `--no-split`: Do not split audio in chunks. This can use large amounts of memory.
 * - `--segment SEGMENT`: Set split size of each chunk. This can help save memory of the graphic card.
 * - `--two-stems STEM`: Only separate audio into {STEM} and no_{STEM}.
 * - `--int24`: Save WAV output as 24-bit.
 * - `--float32`: Save WAV output as float32 (2x bigger).
 * - `--clip-mode {rescale,clamp}`: Strategy for avoiding clipping.
 * - `--flac`: Convert the output WAVs to FLAC.
 * - `--mp3`: Convert the output WAVs to MP3.
 * - `--mp3-bitrate MP3_BITRATE`: Bitrate for MP3 conversion.
 * - `--mp3-preset {2,3,4,5,6,7}`: Encoder preset for MP3 conversion. Default is 2.
 * - `-j JOBS, --jobs JOBS`: Number of concurrent jobs.
 */
export interface DemucsConfigBase {
    help?: boolean;
    sig?: string;
    name?: string;
    repo?: string;
    verbose?: boolean;
    out?: string; // optional here
    filename?: string;
    device?: string;
    shifts?: number;
    overlap?: number;
    noSplit?: boolean;
    segment?: number;
    twoStems?: string;
    int24?: boolean;
    float32?: boolean;
    clipMode?: 'rescale' | 'clamp';
    flac?: boolean;
    mp3?: boolean;
    mp3Bitrate?: number;
    mp3Preset?: number;
    jobs?: number;
}

/**
 * Extended configuration options for the Demucs class.
 *
 * In addition to the base options, we now require:
 * - `out`: the output folder for extracted tracks.
 * - `input`: the path to the input audio file.
 *
 * We also add:
 * - `silent`: If true, suppresses automatic logging of process output.
 * - `demucsEngine`: Determines how to run Demucs ("local" or "docker").
 */
export interface DemucsConfig extends DemucsConfigBase {
    out: string;
    input: string;
    silent?: boolean;
    demucsEngine?: 'docker' | 'local';
}

/**
 * Default configuration values.
 *
 * Note: `out` and `input` are required and have no defaults.
 */
export const DEFAULT_CONFIG: Partial<DemucsConfig> = {
    name: 'htdemucs',
    device: 'cpu',
    silent: true,
    demucsEngine: 'local',
};
