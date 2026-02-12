import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

async function loadFFmpeg(onProgress?: (progress: number, message: string) => void): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Audio]', message);
  });

  onProgress?.(5, 'Loading FFmpeg...');

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  onProgress?.(10, 'FFmpeg loaded');

  return ffmpeg;
}

// Extract audio from video using FFmpeg
export async function extractAudioFromVideo(
  videoFile: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Float32Array> {
  try {
    const ffmpeg = await loadFFmpeg(onProgress);

    onProgress?.(15, 'Preparing video file...');

    // Write video file to FFmpeg virtual filesystem
    const videoData = new Uint8Array(await videoFile.arrayBuffer());
    await ffmpeg.writeFile('input.mp4', videoData);

    onProgress?.(20, 'Extracting audio...');

    // Extract audio as 16kHz mono PCM float32
    // -ar 16000: sample rate 16kHz (Whisper requirement)
    // -ac 1: mono channel
    // -f f32le: 32-bit float little-endian PCM
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-ar', '16000',
      '-ac', '1',
      '-f', 'f32le',
      'output.pcm',
    ]);

    onProgress?.(90, 'Reading audio data...');

    // Read the output PCM file
    const pcmData = await ffmpeg.readFile('output.pcm');

    // Ensure we have Uint8Array data
    if (typeof pcmData === 'string') {
      throw new Error('Unexpected string output from FFmpeg');
    }

    // Convert Uint8Array to Float32Array
    const uint8Array = new Uint8Array(pcmData);
    const float32Data = new Float32Array(
      uint8Array.buffer,
      uint8Array.byteOffset,
      uint8Array.byteLength / 4
    );

    // Copy to a new array to avoid SharedArrayBuffer issues
    const audioData = new Float32Array(float32Data);

    // Cleanup
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile('output.pcm');

    onProgress?.(100, 'Audio extraction complete');

    return audioData;
  } catch (error) {
    console.error('[Audio Extractor] Error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to extract audio: ${error.message}`
        : 'Failed to extract audio from video'
    );
  }
}
