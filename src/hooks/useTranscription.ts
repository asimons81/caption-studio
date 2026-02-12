import { useEffect, useState, useRef, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { videoFileAtom } from '../atoms/videoAtoms';
import { captionSegmentsAtom } from '../atoms/captionAtoms';
import { extractAudioFromVideo } from '../lib/transcription/audioExtractor';
import { addSegment } from '../lib/caption/captionUtils';

export type TranscriptionModel = 'tiny' | 'small';

export type TranscriptionStage =
  | 'idle'
  | 'loading-ffmpeg'
  | 'extracting-audio'
  | 'starting-worker'
  | 'downloading-model'
  | 'transcribing'
  | 'done'
  | 'error';

interface TranscriptionProgress {
  stage: TranscriptionStage;
  progress: number;
  message: string;
}

export function useTranscription() {
  const videoFile = useAtomValue(videoFileAtom);
  const setSegments = useSetAtom(captionSegmentsAtom);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState<TranscriptionProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [debugDetails, setDebugDetails] = useState<string>('');

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const hangTimerRef = useRef<number | null>(null);
  const debugLogRef = useRef<string[]>([]);

  const pushDebug = useCallback((line: string) => {
    const ts = new Date().toISOString();
    debugLogRef.current.push(`[${ts}] ${line}`);
    // Keep bounded to avoid unbounded memory growth on long sessions.
    if (debugLogRef.current.length > 300) {
      debugLogRef.current.splice(0, debugLogRef.current.length - 300);
    }
    setDebugDetails(debugLogRef.current.join('\n'));
  }, []);

  const clearHangTimer = useCallback(() => {
    if (hangTimerRef.current !== null) {
      window.clearTimeout(hangTimerRef.current);
      hangTimerRef.current = null;
    }
  }, []);

  const bumpHangTimer = useCallback(() => {
    clearHangTimer();
    // If we stop receiving progress, assume the worker is hung (network/model/wasm deadlock)
    // and fail loudly instead of silently spinning forever.
    hangTimerRef.current = window.setTimeout(() => {
      pushDebug('Hang timeout reached; terminating worker.');
      try {
        workerRef.current?.terminate();
      } catch {
        /* ignore */
      }
      workerRef.current = null;
      requestIdRef.current = null;
      setProgress({ stage: 'error', progress: 0, message: 'Transcription timed out' });
      setError('Transcription timed out. Open Diagnostics and check cross-origin isolation and model download connectivity.');
      setIsTranscribing(false);
    }, 120_000);
  }, [clearHangTimer, pushDebug]);

  useEffect(() => {
    return () => {
      clearHangTimer();
      try {
        workerRef.current?.terminate();
      } catch {
        /* ignore */
      }
      workerRef.current = null;
      requestIdRef.current = null;
    };
  }, [clearHangTimer]);

  const startTranscription = useCallback(
    async (model: TranscriptionModel = 'tiny') => {
      if (isTranscribing) return;
      if (!videoFile) {
        setError('No video file loaded');
        return;
      }

      if (typeof window !== 'undefined' && window.crossOriginIsolated === false) {
        setProgress({ stage: 'error', progress: 0, message: 'Cross-origin isolation missing' });
        setError(
          'Transcription requires cross-origin isolation (COOP/COEP). In dev/preview, ensure the app is served with COOP: same-origin and COEP: require-corp.'
        );
        pushDebug('Blocked start: window.crossOriginIsolated === false');
        return;
      }

      setIsTranscribing(true);
      setError(null);
      setProgress({ stage: 'loading-ffmpeg', progress: 0, message: 'Loading FFmpeg...' });
      debugLogRef.current = [];
      setDebugDetails('');
      pushDebug(`Start transcription (model=${model})`);

      const requestId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      requestIdRef.current = requestId;
      bumpHangTimer();

      try {
        // Extract audio from video with progress callback
        const audioData = await extractAudioFromVideo(videoFile.file, (progress, message) => {
          bumpHangTimer();
          const stage: TranscriptionStage = progress <= 10 || message.toLowerCase().includes('loading ffmpeg')
            ? 'loading-ffmpeg'
            : 'extracting-audio';
          setProgress({ stage, progress, message });
          pushDebug(`[audio] ${Math.round(progress)}% ${message}`);
        });

        setProgress({ stage: 'starting-worker', progress: 0, message: 'Starting transcription worker...' });
        pushDebug('Audio extracted; creating transcription worker');

        // Create transcription worker
        workerRef.current = new Worker(
          new URL('../workers/transcription.worker.ts', import.meta.url),
          { type: 'module' }
        );

        // Set up message handler
        workerRef.current.onmessage = (e) => {
          bumpHangTimer();
          const { type } = e.data ?? {};
          pushDebug(`[worker->ui] ${JSON.stringify(e.data)}`);

          if (type === 'progress') {
            const { stage, progress: prog, message } = e.data;
            setProgress({ stage, progress: prog, message });
          } else if (type === 'segment') {
            // Add segment as it's generated
            const { text, startTime, endTime } = e.data;
            setSegments((prev) => addSegment(prev, text, startTime, endTime));
          } else if (type === 'complete') {
            setProgress({ stage: 'done', progress: 100, message: 'Transcription complete!' });
            setTimeout(() => {
              setIsTranscribing(false);
            }, 1000);
            workerRef.current?.terminate();
            workerRef.current = null;
            requestIdRef.current = null;
            clearHangTimer();
          } else if (type === 'error') {
            const errObj = e.data?.error;
            const msg =
              typeof errObj?.message === 'string'
                ? errObj.message
                : typeof e.data?.error === 'string'
                  ? e.data.error
                  : 'Transcription failed';

            setProgress({ stage: 'error', progress: 0, message: 'Transcription failed' });
            setError(msg);
            setIsTranscribing(false);
            workerRef.current?.terminate();
            workerRef.current = null;
            requestIdRef.current = null;
            clearHangTimer();
          }
        };

        workerRef.current.onerror = (err) => {
          pushDebug(`[worker:error] ${err.message}`);
          setProgress({ stage: 'error', progress: 0, message: 'Worker crashed' });
          setError(`Worker error: ${err.message}`);
          setIsTranscribing(false);
          workerRef.current?.terminate();
          workerRef.current = null;
          requestIdRef.current = null;
          clearHangTimer();
        };

        workerRef.current.onmessageerror = (err) => {
          pushDebug(`[worker:messageerror] ${String(err)}`);
          setProgress({ stage: 'error', progress: 0, message: 'Worker message error' });
          setError('Worker message error. Check console for details.');
          setIsTranscribing(false);
          workerRef.current?.terminate();
          workerRef.current = null;
          requestIdRef.current = null;
          clearHangTimer();
        };

        // Start transcription
        setProgress({ stage: 'downloading-model', progress: 0, message: 'Starting model download...' });
        pushDebug('Posting transcribe request to worker');
        workerRef.current.postMessage({
          type: 'transcribe',
          audioData,
          model,
          requestId,
        });
      } catch (err) {
        pushDebug(`[ui:error] ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
        setProgress({ stage: 'error', progress: 0, message: 'Transcription failed' });
        setError(err instanceof Error ? err.message : 'Transcription failed');
        setIsTranscribing(false);
        requestIdRef.current = null;
        clearHangTimer();
      }
    },
    [bumpHangTimer, clearHangTimer, isTranscribing, pushDebug, setSegments, videoFile]
  );

  const cancelTranscription = useCallback(() => {
    pushDebug('Cancel transcription requested');
    const requestId = requestIdRef.current;
    if (workerRef.current && requestId) {
      try {
        workerRef.current.postMessage({ type: 'cancel', requestId });
      } catch {
        /* ignore */
      }
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsTranscribing(false);
    requestIdRef.current = null;
    clearHangTimer();
    setProgress({ stage: 'idle', progress: 0, message: '' });
  }, [clearHangTimer, pushDebug]);

  return {
    isTranscribing,
    progress,
    error,
    debugDetails,
    startTranscription,
    cancelTranscription,
  };
}
