import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import type { CaptionSegment, CaptionStyle } from '../types/caption';
import { generateASS } from '../lib/export/assGenerator';

let ffmpeg: FFmpeg | null = null;

interface ExportMessage {
  type: 'export';
  videoFile: File;
  segments: CaptionSegment[];
  style: CaptionStyle;
  videoWidth: number;
  videoHeight: number;
  quality: 'fast' | 'balanced' | 'high';
}

interface ProgressMessage {
  type: 'progress';
  progress: number;
  message: string;
}

interface CompleteMessage {
  type: 'complete';
  blob: Blob;
}

interface ErrorMessage {
  type: 'error';
  error: string;
}

async function loadFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  // Post progress messages
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  ffmpeg.on('progress', ({ progress, time }) => {
    const message = `Encoding video... ${time}ms`;
    postMessage({ type: 'progress', progress: progress * 100, message } as ProgressMessage);
  });

  // Load FFmpeg core
  // Must be same-origin when Cross-Origin-Embedder-Policy is enabled (COEP: require-corp).
  const baseURL = `${import.meta.env.BASE_URL}ffmpeg`;

  postMessage({
    type: 'progress',
    progress: 10,
    message: 'Loading FFmpeg...',
  } as ProgressMessage);

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
  });

  postMessage({
    type: 'progress',
    progress: 20,
    message: 'FFmpeg loaded',
  } as ProgressMessage);

  return ffmpeg;
}

async function exportVideo(data: ExportMessage) {
  try {
    const ffmpeg = await loadFFmpeg();

    // Quality settings (CRF: lower = better quality, larger file)
    const qualityMap = {
      fast: 28,
      balanced: 23,
      high: 18,
    };
    const crf = qualityMap[data.quality];

    postMessage({
      type: 'progress',
      progress: 30,
      message: 'Preparing files...',
    } as ProgressMessage);

    // Write video file to virtual filesystem
    const videoData = new Uint8Array(await data.videoFile.arrayBuffer());
    const inputExt = data.videoFile.name.split('.').pop()?.toLowerCase() || 'mp4';
    const inputName = `input.${inputExt}`;
    await ffmpeg.writeFile(inputName, videoData);

    // Generate ASS subtitle file
    const assContent = generateASS(
      data.segments,
      data.style,
      data.videoWidth,
      data.videoHeight
    );
    await ffmpeg.writeFile('subtitles.ass', new TextEncoder().encode(assContent));

    postMessage({
      type: 'progress',
      progress: 40,
      message: 'Starting encoding...',
    } as ProgressMessage);

    // Run FFmpeg command to burn subtitles
    await ffmpeg.exec([
      '-i', inputName,
      '-vf', 'ass=subtitles.ass',
      '-c:v', 'libx264',
      '-crf', crf.toString(),
      '-preset', 'medium',
      '-c:a', 'copy',
      'output.mp4',
    ]);

    postMessage({
      type: 'progress',
      progress: 90,
      message: 'Finalizing...',
    } as ProgressMessage);

    // Read output file
    const outputData = await ffmpeg.readFile('output.mp4');
    // Convert to regular Uint8Array to avoid SharedArrayBuffer issues
    const regularArray = new Uint8Array(outputData as unknown as ArrayBuffer);
    const blob = new Blob([regularArray], { type: 'video/mp4' });

    // Cleanup
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile('subtitles.ass');
    await ffmpeg.deleteFile('output.mp4');

    postMessage({
      type: 'complete',
      blob,
    } as CompleteMessage);
  } catch (error) {
    console.error('[Export Worker] Error:', error);
    postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Export failed',
    } as ErrorMessage);
  }
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<ExportMessage>) => {
  if (e.data.type === 'export') {
    await exportVideo(e.data);
  }
};

export {};
