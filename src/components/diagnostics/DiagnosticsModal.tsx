import { useEffect, useMemo, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '../ui/Modal';
import { Button } from '../ui/Button';

/* eslint-disable react-hooks/set-state-in-effect */
type AssetCheck = {
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
  required?: boolean;
};

type WorkerCheck = {
  ok: boolean;
  error?: string;
};

type ModelDownloadTestState =
  | { status: 'idle' }
  | { status: 'running'; message: string }
  | { status: 'ok'; message: string }
  | { status: 'error'; message: string };

async function checkAsset(url: string, required = true): Promise<AssetCheck> {
  try {
    // Prefer HEAD, but some static hosts might not support it consistently.
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (res.ok) return { url, ok: true, status: res.status, required };
  } catch {
    // fall through to GET
  }

  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    return { url, ok: res.ok, status: res.status, required };
  } catch (e) {
    return { url, ok: false, error: e instanceof Error ? e.message : String(e), required };
  }
}

async function checkTranscriptionWorker(): Promise<WorkerCheck> {
  try {
    const worker = new Worker(new URL('../../workers/transcription.worker.ts', import.meta.url), {
      type: 'module',
    });

    const result = await new Promise<WorkerCheck>((resolve) => {
      const t = window.setTimeout(() => {
        try {
          worker.terminate();
        } catch {
          /* ignore */
        }
        resolve({ ok: false, error: 'Timed out waiting for worker pong' });
      }, 2000);

      worker.onmessage = (e) => {
        if (e.data?.type === 'pong') {
          window.clearTimeout(t);
          try {
            worker.terminate();
          } catch {
            /* ignore */
          }
          resolve({ ok: true });
        }
      };

      worker.onerror = (err) => {
        window.clearTimeout(t);
        try {
          worker.terminate();
        } catch {
          /* ignore */
        }
        resolve({ ok: false, error: err.message });
      };

      worker.onmessageerror = () => {
        window.clearTimeout(t);
        try {
          worker.terminate();
        } catch {
          /* ignore */
        }
        resolve({ ok: false, error: 'Worker message error' });
      };

      worker.postMessage({ type: 'ping' });
    });

    return result;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function runModelDownloadTest(
  onProgress: (message: string) => void
): Promise<{ ok: boolean; error?: string }> {
  try {
    const worker = new Worker(new URL('../../workers/transcription.worker.ts', import.meta.url), {
      type: 'module',
    });

    const result = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
      const timeout = window.setTimeout(() => {
        try {
          worker.terminate();
        } catch {
          /* ignore */
        }
        resolve({ ok: false, error: 'Model test timed out while downloading/loading model.' });
      }, 120000);

      worker.onmessage = (e) => {
        if (e.data?.type === 'progress' && typeof e.data?.message === 'string') {
          onProgress(e.data.message);
          return;
        }

        if (e.data?.type === 'model-test-result') {
          window.clearTimeout(timeout);
          try {
            worker.terminate();
          } catch {
            /* ignore */
          }
          resolve({
            ok: Boolean(e.data.ok),
            error: typeof e.data.error === 'string' ? e.data.error : undefined,
          });
        }
      };

      worker.onerror = (err) => {
        window.clearTimeout(timeout);
        try {
          worker.terminate();
        } catch {
          /* ignore */
        }
        resolve({ ok: false, error: err.message || 'Worker crashed during model test' });
      };

      worker.onmessageerror = () => {
        window.clearTimeout(timeout);
        try {
          worker.terminate();
        } catch {
          /* ignore */
        }
        resolve({ ok: false, error: 'Worker message error during model test' });
      };

      worker.postMessage({ type: 'model-test', model: 'tiny' });
    });

    return result;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function DiagnosticsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isIsolated = typeof window !== 'undefined' ? window.crossOriginIsolated : false;
  const hasSAB = typeof SharedArrayBuffer !== 'undefined';

  const assetChecksConfig = useMemo(
    () => {
      const base = import.meta.env.BASE_URL || '/';
      return [
        { url: `${base}ffmpeg/ffmpeg-core.js`, required: true },
        { url: `${base}ffmpeg/ffmpeg-core.wasm`, required: true },
        { url: `${base}ffmpeg/ffmpeg-core.worker.js`, required: false },
      ];
    },
    []
  );

  const [assets, setAssets] = useState<AssetCheck[] | null>(null);
  const [worker, setWorker] = useState<WorkerCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [modelDownloadTest, setModelDownloadTest] = useState<ModelDownloadTestState>({ status: 'idle' });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsChecking(true);
    setAssets(null);
    setWorker(null);

    (async () => {
      const assetChecks = await Promise.all(
        assetChecksConfig.map((asset) => checkAsset(asset.url, asset.required))
      );
      const workerCheck = await checkTranscriptionWorker();
      if (cancelled) return;
      setAssets(assetChecks);
      setWorker(workerCheck);
      setIsChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [assetChecksConfig, open]);

  const handleModelDownloadTest = async () => {
    setModelDownloadTest({
      status: 'running',
      message: 'Starting model download test (tiny)...',
    });

    const result = await runModelDownloadTest((message) => {
      setModelDownloadTest({
        status: 'running',
        message,
      });
    });

    if (result.ok) {
      setModelDownloadTest({
        status: 'ok',
        message: 'Model download/load succeeded in worker.',
      });
      return;
    }

    setModelDownloadTest({
      status: 'error',
      message: `Model test failed: ${result.error ?? 'unknown error'}`,
    });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Diagnostics</ModalTitle>
          <ModalDescription>
            Checks for cross-origin isolation, FFmpeg core assets, and worker startup. Useful when transcription silently fails.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span>crossOriginIsolated</span>
              <span className={isIsolated ? 'text-green-600' : 'text-destructive'}>
                {String(isIsolated)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>SharedArrayBuffer</span>
              <span className={hasSAB ? 'text-green-600' : 'text-destructive'}>
                {hasSAB ? 'available' : 'missing'}
              </span>
            </div>
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <div className="font-medium">FFmpeg core assets (same-origin)</div>
            {assets === null ? (
              <div className="text-muted-foreground">{isChecking ? 'Checking...' : 'Not checked'}</div>
            ) : (
              <div className="space-y-1">
                {assets.map((a) => (
                  <div key={a.url} className="flex items-center justify-between gap-4">
                    <span className="truncate">
                      {a.url}
                      {!a.required && ' (optional)'}
                    </span>
                    <span className={a.ok ? 'text-green-600' : a.required ? 'text-destructive' : 'text-yellow-600'}>
                      {a.ok
                        ? `OK${a.status ? ` (${a.status})` : ''}`
                        : a.required
                          ? `FAIL${a.status ? ` (${a.status})` : ''}`
                          : `MISSING${a.status ? ` (${a.status})` : ''}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <div className="font-medium">Transcription worker</div>
            {worker === null ? (
              <div className="text-muted-foreground">{isChecking ? 'Checking...' : 'Not checked'}</div>
            ) : (
              <div className={worker.ok ? 'text-green-600' : 'text-destructive'}>
                {worker.ok ? 'OK (pong received)' : `FAIL: ${worker.error ?? 'unknown error'}`}
              </div>
            )}
          </div>

          <div className="rounded-lg border p-3 space-y-2">
            <div className="font-medium">Model download reachability (worker)</div>
            {modelDownloadTest.status === 'idle' && (
              <div className="text-muted-foreground">
                Runs a tiny-model initialization in the worker to verify outbound model download/load path.
              </div>
            )}
            {modelDownloadTest.status !== 'idle' && (
              <div className={
                modelDownloadTest.status === 'ok'
                  ? 'text-green-600'
                  : modelDownloadTest.status === 'error'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }>
                {modelDownloadTest.message}
              </div>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleModelDownloadTest}
              disabled={modelDownloadTest.status === 'running'}
            >
              {modelDownloadTest.status === 'running' ? 'Testing...' : 'Start model download test'}
            </Button>
            {modelDownloadTest.status === 'error' && (
              <div className="text-xs text-muted-foreground">
                If this fails, check network access to model hosts and browser console for CORS/COEP errors.
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
