import { useState, useRef, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { captionSegmentsAtom, globalStyleAtom } from '../atoms/captionAtoms';
import { videoFileAtom } from '../atoms/videoAtoms';

export type ExportQuality = 'fast' | 'balanced' | 'high';

interface ExportProgress {
  progress: number;
  message: string;
}

export function useExport() {
  const segments = useAtomValue(captionSegmentsAtom);
  const style = useAtomValue(globalStyleAtom);
  const videoFile = useAtomValue(videoFileAtom);

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({ progress: 0, message: '' });
  const [error, setError] = useState<string | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);

  const workerRef = useRef<Worker | null>(null);

  const startExport = useCallback(
    async (quality: ExportQuality = 'balanced') => {
      if (!videoFile || segments.length === 0) {
        setError('No video or captions to export');
        return;
      }

      setIsExporting(true);
      setError(null);
      setProgress({ progress: 0, message: 'Initializing...' });
      setExportedBlob(null);

      try {
        // Create worker
        workerRef.current = new Worker(
          new URL('../workers/export.worker.ts', import.meta.url),
          { type: 'module' }
        );

        // Set up message handler
        workerRef.current.onmessage = (e) => {
          const { type, progress: prog, message, blob, error: err } = e.data;

          if (type === 'progress') {
            setProgress({ progress: prog, message });
          } else if (type === 'complete') {
            setProgress({ progress: 100, message: 'Export complete!' });
            setExportedBlob(blob);
            setIsExporting(false);
            workerRef.current?.terminate();
            workerRef.current = null;
          } else if (type === 'error') {
            setError(err);
            setIsExporting(false);
            workerRef.current?.terminate();
            workerRef.current = null;
          }
        };

        workerRef.current.onerror = (err) => {
          setError(`Worker error: ${err.message}`);
          setIsExporting(false);
          workerRef.current?.terminate();
          workerRef.current = null;
        };

        // Start export
        workerRef.current.postMessage({
          type: 'export',
          videoFile: videoFile.file,
          segments,
          style,
          videoWidth: videoFile.width,
          videoHeight: videoFile.height,
          quality,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start export');
        setIsExporting(false);
      }
    },
    [videoFile, segments, style]
  );

  const cancelExport = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsExporting(false);
    setProgress({ progress: 0, message: '' });
  }, []);

  const downloadExport = useCallback((filename?: string) => {
    if (!exportedBlob) return;

    const url = URL.createObjectURL(exportedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `caption-studio-export-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportedBlob]);

  return {
    isExporting,
    progress,
    error,
    exportedBlob,
    startExport,
    cancelExport,
    downloadExport,
  };
}
