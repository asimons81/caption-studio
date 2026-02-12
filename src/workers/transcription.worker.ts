import { pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let transcriberModelId: string | null = null;
let activeRequestId: string | null = null;
let shouldAbort = false;

interface TranscribeMessage {
  type: 'transcribe';
  audioData: Float32Array;
  model: 'tiny' | 'small';
  requestId: string;
}

interface ProgressMessage {
  type: 'progress';
  stage: 'downloading-model' | 'transcribing';
  progress: number;
  message: string;
  detail?: unknown;
}

interface SegmentMessage {
  type: 'segment';
  text: string;
  startTime: number;
  endTime: number;
}

interface CompleteMessage {
  type: 'complete';
}

interface ErrorMessage {
  type: 'error';
  error: {
    message: string;
    name?: string;
    stack?: string;
    detail?: unknown;
  };
}

interface PingMessage {
  type: 'ping';
}

interface PongMessage {
  type: 'pong';
}

interface CancelMessage {
  type: 'cancel';
  requestId: string;
}

interface ModelTestMessage {
  type: 'model-test';
  model?: 'tiny' | 'small';
}

interface ModelTestResultMessage {
  type: 'model-test-result';
  ok: boolean;
  error?: string;
}

function postProgress(msg: Omit<ProgressMessage, 'type'>) {
  postMessage({ type: 'progress', ...msg } as ProgressMessage);
}

function postWorkerError(error: unknown, detail?: unknown) {
  const e = error instanceof Error ? error : new Error('Unknown worker error');
  postMessage({
    type: 'error',
    error: {
      message: e.message,
      name: e.name,
      stack: e.stack,
      detail,
    },
  } as ErrorMessage);
}

function throwIfAborted(requestId: string) {
  if (shouldAbort && activeRequestId === requestId) {
    throw new Error('Transcription cancelled');
  }
}

async function loadModel(modelName: 'tiny' | 'small', requestId: string) {
  const modelId = modelName === 'tiny' ? 'Xenova/whisper-tiny.en' : 'Xenova/whisper-small.en';

  if (transcriber && transcriberModelId === modelId) return transcriber;

  // If switching models, reset the cached pipeline.
  transcriber = null;
  transcriberModelId = null;

  postProgress({
    stage: 'downloading-model',
    progress: 1,
    message: `Downloading ${modelName} model...`,
  });

  try {
    let lastProgressAt = 0;
    const progress_callback = (data: unknown) => {
      // Throttle to keep UI responsive.
      const now = Date.now();
      if (now - lastProgressAt < 200) return;
      lastProgressAt = now;

      let pct: number | null = null;
      if (typeof data === 'number') {
        pct = Math.max(0, Math.min(1, data)) * 100;
      } else if (typeof data === 'object' && data !== null && 'progress' in data && typeof (data as { progress: unknown }).progress === 'number') {
        pct = Math.max(0, Math.min(1, (data as { progress: number }).progress)) * 100;
      } else if (
        typeof data === 'object' &&
        data !== null &&
        'loaded' in data &&
        'total' in data &&
        typeof (data as { loaded: unknown }).loaded === 'number' &&
        typeof (data as { total: unknown }).total === 'number' &&
        (data as { total: number }).total > 0
      ) {
        pct = Math.max(0, Math.min(1, (data as { loaded: number; total: number }).loaded / (data as { loaded: number; total: number }).total)) * 100;
      }

      if (pct !== null) {
        postProgress({
          stage: 'downloading-model',
          progress: Math.max(1, Math.min(70, pct * 0.7)),
          message: `Downloading ${modelName} model...`,
          detail: data,
        });
      }
    };

    throwIfAborted(requestId);

    // Create pipeline (cast to resolve complex type)
    transcriber = (await pipeline(
      'automatic-speech-recognition',
      modelId,
      // @ts-expect-error transformers types don't fully describe progress_callback in this version
      { progress_callback }
    )) as unknown as AutomaticSpeechRecognitionPipeline;
    transcriberModelId = modelId;

    postProgress({
      stage: 'downloading-model',
      progress: 70,
      message: 'Model loaded',
    });

    return transcriber;
  } catch (error) {
    console.error('[Transcription Worker] Model load error:', error);
    postWorkerError(error, { phase: 'loadModel', modelId });
    throw error;
  }
}

async function transcribeAudio(data: TranscribeMessage) {
  try {
    activeRequestId = data.requestId;
    shouldAbort = false;

    const model = await loadModel(data.model, data.requestId);
    throwIfAborted(data.requestId);

    postProgress({
      stage: 'transcribing',
      progress: 75,
      message: 'Transcribing audio...',
    });

    // Perform transcription with timestamps
    const result: unknown = await model(data.audioData, {
      return_timestamps: 'word',
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    throwIfAborted(data.requestId);

    postProgress({
      stage: 'transcribing',
      progress: 90,
      message: 'Processing results...',
    });

    // Process chunks into segments
    if (typeof result === 'object' && result !== null && 'chunks' in result && Array.isArray((result as { chunks: unknown }).chunks)) {
      let currentSegment = {
        text: '',
        startTime: 0,
        endTime: 0,
      };

      const chunks = (result as { chunks: Array<{ text: string; timestamp: [number | null, number | null] }> }).chunks;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const word = chunk.text.trim();

        if (!word) continue;

        // Start new segment
        if (!currentSegment.text) {
          currentSegment.text = word;
          currentSegment.startTime = chunk.timestamp[0] || 0;
          currentSegment.endTime = chunk.timestamp[1] || 0;
        } else {
          currentSegment.text += ' ' + word;
          currentSegment.endTime = chunk.timestamp[1] || currentSegment.endTime;
        }

        // Create segment every ~5 seconds or ~10 words
        const wordCount = currentSegment.text.split(' ').length;
        const duration = currentSegment.endTime - currentSegment.startTime;

        if (wordCount >= 10 || duration >= 5 || i === chunks.length - 1) {
          if (currentSegment.text.trim()) {
            postMessage({
              type: 'segment',
              text: currentSegment.text.trim(),
              startTime: currentSegment.startTime,
              endTime: currentSegment.endTime,
            } as SegmentMessage);
          }

          // Reset for next segment
          currentSegment = {
            text: '',
            startTime: 0,
            endTime: 0,
          };
        }
      }
    } else if (typeof result === 'object' && result !== null && 'text' in result && typeof (result as { text: unknown }).text === 'string') {
      // Fallback: single segment
      postMessage({
        type: 'segment',
        text: (result as { text: string }).text,
        startTime: 0,
        endTime: 10, // Default 10 seconds
      } as SegmentMessage);
    }

    postMessage({
      type: 'complete',
    } as CompleteMessage);
  } catch (error) {
    console.error('[Transcription Worker] Error:', error);
    postWorkerError(error, { phase: 'transcribeAudio' });
  }
}

async function runModelTest(model: 'tiny' | 'small' = 'tiny') {
  const requestId = `model-test-${Date.now()}`;

  try {
    shouldAbort = false;
    await loadModel(model, requestId);
    postMessage({
      type: 'model-test-result',
      ok: true,
    } as ModelTestResultMessage);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown model download error';
    postMessage({
      type: 'model-test-result',
      ok: false,
      error: message,
    } as ModelTestResultMessage);
  }
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<TranscribeMessage | PingMessage | CancelMessage | ModelTestMessage>) => {
  if (e.data.type === 'ping') {
    postMessage({ type: 'pong' } as PongMessage);
    return;
  }

  if (e.data.type === 'cancel') {
    // Best-effort abort. If transformers doesn't support aborting mid-call,
    // the main thread should still terminate the worker as the hard stop.
    if (activeRequestId === e.data.requestId) {
      shouldAbort = true;
    }
    return;
  }

  if (e.data.type === 'transcribe') {
    await transcribeAudio(e.data);
    return;
  }

  if (e.data.type === 'model-test') {
    await runModelTest(e.data.model ?? 'tiny');
  }
};

export {};
