import { pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;

interface TranscribeMessage {
  type: 'transcribe';
  audioData: Float32Array;
  model: 'tiny' | 'small';
}

interface ProgressMessage {
  type: 'progress';
  phase: 'download' | 'load' | 'transcribe';
  progress: number;
  message: string;
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
  error: string;
}

async function loadModel(modelName: 'tiny' | 'small') {
  if (transcriber) return transcriber;

  const modelId = modelName === 'tiny' ? 'Xenova/whisper-tiny.en' : 'Xenova/whisper-small.en';

  postMessage({
    type: 'progress',
    phase: 'download',
    progress: 10,
    message: `Downloading ${modelName} model...`,
  } as ProgressMessage);

  try {
    // Create pipeline (cast to resolve complex type)
    transcriber = (await pipeline('automatic-speech-recognition', modelId)) as unknown as AutomaticSpeechRecognitionPipeline;

    postMessage({
      type: 'progress',
      phase: 'load',
      progress: 70,
      message: 'Model loaded',
    } as ProgressMessage);

    return transcriber;
  } catch (error) {
    console.error('[Transcription Worker] Model load error:', error);
    postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Failed to load model',
    } as ErrorMessage);
    throw error;
  }
}

async function transcribeAudio(data: TranscribeMessage) {
  try {
    const model = await loadModel(data.model);

    postMessage({
      type: 'progress',
      phase: 'transcribe',
      progress: 75,
      message: 'Transcribing audio...',
    } as ProgressMessage);

    // Perform transcription with timestamps
    const result: any = await model(data.audioData, {
      return_timestamps: 'word',
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    postMessage({
      type: 'progress',
      phase: 'transcribe',
      progress: 90,
      message: 'Processing results...',
    } as ProgressMessage);

    // Process chunks into segments
    if (result && Array.isArray(result.chunks)) {
      let currentSegment = {
        text: '',
        startTime: 0,
        endTime: 0,
      };

      for (let i = 0; i < result.chunks.length; i++) {
        const chunk = result.chunks[i];
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

        if (wordCount >= 10 || duration >= 5 || i === result.chunks.length - 1) {
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
    } else if (typeof result.text === 'string') {
      // Fallback: single segment
      postMessage({
        type: 'segment',
        text: result.text,
        startTime: 0,
        endTime: 10, // Default 10 seconds
      } as SegmentMessage);
    }

    postMessage({
      type: 'complete',
    } as CompleteMessage);
  } catch (error) {
    console.error('[Transcription Worker] Error:', error);
    postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Transcription failed',
    } as ErrorMessage);
  }
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<TranscribeMessage>) => {
  if (e.data.type === 'transcribe') {
    await transcribeAudio(e.data);
  }
};

export {};
