import { useState, useRef, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { videoFileAtom } from '../atoms/videoAtoms';
import { captionSegmentsAtom } from '../atoms/captionAtoms';
import { extractAudioFromVideo } from '../lib/transcription/audioExtractor';
import { addSegment } from '../lib/caption/captionUtils';

export type TranscriptionModel = 'tiny' | 'small';

interface TranscriptionProgress {
  phase: 'download' | 'load' | 'extract' | 'transcribe';
  progress: number;
  message: string;
}

export function useTranscription() {
  const videoFile = useAtomValue(videoFileAtom);
  const setSegments = useSetAtom(captionSegmentsAtom);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState<TranscriptionProgress>({
    phase: 'extract',
    progress: 0,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  const startTranscription = useCallback(
    async (model: TranscriptionModel = 'tiny') => {
      if (!videoFile) {
        setError('No video file loaded');
        return;
      }

      setIsTranscribing(true);
      setError(null);
      setProgress({ phase: 'extract', progress: 0, message: 'Extracting audio...' });

      try {
        // Extract audio from video with progress callback
        const audioData = await extractAudioFromVideo(videoFile.file, (progress, message) => {
          setProgress({ phase: 'extract', progress, message });
        });

        setProgress({ phase: 'extract', progress: 10, message: 'Audio extracted, loading model...' });

        // Create transcription worker
        workerRef.current = new Worker(
          new URL('../workers/transcription.worker.ts', import.meta.url),
          { type: 'module' }
        );

        // Set up message handler
        workerRef.current.onmessage = (e) => {
          const { type, phase, progress: prog, message, text, startTime, endTime, error: err } = e.data;

          if (type === 'progress') {
            setProgress({ phase, progress: prog, message });
          } else if (type === 'segment') {
            // Add segment as it's generated
            setSegments((prev) => addSegment(prev, text, startTime, endTime));
          } else if (type === 'complete') {
            setProgress({ phase: 'transcribe', progress: 100, message: 'Transcription complete!' });
            setTimeout(() => {
              setIsTranscribing(false);
            }, 1000);
            workerRef.current?.terminate();
            workerRef.current = null;
          } else if (type === 'error') {
            setError(err);
            setIsTranscribing(false);
            workerRef.current?.terminate();
            workerRef.current = null;
          }
        };

        workerRef.current.onerror = (err) => {
          setError(`Worker error: ${err.message}`);
          setIsTranscribing(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        };

        // Start transcription
        workerRef.current.postMessage({
          type: 'transcribe',
          audioData,
          model,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to extract audio');
        setIsTranscribing(false);
      }
    },
    [videoFile, setSegments]
  );

  const cancelTranscription = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsTranscribing(false);
    setProgress({ phase: 'extract', progress: 0, message: '' });
  }, []);

  return {
    isTranscribing,
    progress,
    error,
    startTranscription,
    cancelTranscription,
  };
}
