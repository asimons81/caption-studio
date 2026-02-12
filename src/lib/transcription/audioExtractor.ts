import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
const ffmpegLogTail: string[] = [];
const MAX_FFMPEG_LOG_LINES = 200;
const workerURLState: {
  resolved: boolean;
  available: boolean;
} = {
  resolved: false,
  available: false,
};

function pushFFmpegLog(line: string) {
  ffmpegLogTail.push(line);
  if (ffmpegLogTail.length > MAX_FFMPEG_LOG_LINES) {
    ffmpegLogTail.splice(0, ffmpegLogTail.length - MAX_FFMPEG_LOG_LINES);
  }
}

function getFFmpegLogTail(lines = 40) {
  return ffmpegLogTail.slice(Math.max(0, ffmpegLogTail.length - lines));
}

function inferInputExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName !== file.name.toLowerCase()) return fromName;

  switch (file.type) {
    case 'video/mp4':
      return 'mp4';
    case 'video/webm':
      return 'webm';
    case 'video/quicktime':
      return 'mov';
    case 'video/x-matroska':
      return 'mkv';
    default:
      return 'mp4';
  }
}

async function loadFFmpeg(onProgress?: (progress: number, message: string) => void): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Audio]', message);
    pushFFmpegLog(message);
  });

  onProgress?.(5, 'Loading FFmpeg...');

  // Must be same-origin when Cross-Origin-Embedder-Policy is enabled (COEP: require-corp).
  const baseURL = new URL(`ffmpeg/`, window.location.origin + import.meta.env.BASE_URL).toString().replace(/\/$/, '');

  const loadOptions: {
    coreURL: string;
    wasmURL: string;
    workerURL?: string;
  } = {
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  };

  if (!workerURLState.resolved) {
    try {
      const workerRes = await fetch(`${baseURL}/ffmpeg-core.worker.js`, { method: 'HEAD', cache: 'no-store' });
      workerURLState.available = workerRes.ok;
    } catch {
      workerURLState.available = false;
    } finally {
      workerURLState.resolved = true;
    }
  }

  if (workerURLState.available) {
    try {
      loadOptions.workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');
    } catch (e) {
      console.warn('[FFmpeg Audio] Failed to prepare worker URL, falling back without explicit workerURL:', e);
    }
  }

  await ffmpeg.load(loadOptions);

  onProgress?.(10, 'FFmpeg loaded');

  return ffmpeg;
}

// Extract audio from video using FFmpeg
export async function extractAudioFromVideo(
  videoFile: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Float32Array> {
  const inputExt = inferInputExtension(videoFile);
  const inputName = `input.${inputExt}`;
  const outputName = 'output.pcm';

  try {
    const ffmpeg = await loadFFmpeg(onProgress);
    ffmpegLogTail.length = 0;

    onProgress?.(15, 'Preparing video file...');

    // Write video file to FFmpeg virtual filesystem
    const videoData = new Uint8Array(await videoFile.arrayBuffer());
    await ffmpeg.writeFile(inputName, videoData);

    onProgress?.(20, 'Extracting audio...');

    // Extract audio as 16kHz mono PCM float32
    // -ar 16000: sample rate 16kHz (Whisper requirement)
    // -ac 1: mono channel
    // -f f32le: 32-bit float little-endian PCM
    try {
      await ffmpeg.exec([
        '-i', inputName,
        '-vn',
        '-map', '0:a:0',
        '-ar', '16000',
        '-ac', '1',
        '-f', 'f32le',
        outputName,
      ]);
    } catch {
      const tail = getFFmpegLogTail().join('\n');
      const noAudio = tail.toLowerCase().includes('matches no streams') || tail.toLowerCase().includes('no such file or directory');
      const hint = noAudio ? 'No audio track found in this video.' : 'FFmpeg failed to decode the video/audio.';
      throw new Error(`${hint}\n\nFFmpeg log tail:\n${tail}`);
    }

    onProgress?.(90, 'Reading audio data...');

    // Read the output PCM file
    const pcmData = await ffmpeg.readFile(outputName);

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
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    onProgress?.(100, 'Audio extraction complete');

    return audioData;
  } catch (error) {
    console.error('[Audio Extractor] Error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to extract audio: ${error.message}`
        : 'Failed to extract audio from video'
    );
  } finally {
    // Best-effort cleanup (ignore errors; file may not exist).
    try {
      if (ffmpeg) await ffmpeg.deleteFile(inputName);
    } catch {
      /* ignore */
    }
    try {
      if (ffmpeg) await ffmpeg.deleteFile(outputName);
    } catch {
      /* ignore */
    }
  }
}
