import { useEffect, useMemo, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '../ui/Modal';
import { Button } from '../ui/Button';

/* eslint-disable react-hooks/set-state-in-effect */
type AssetCheck = {
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
};

type WorkerCheck = {
  ok: boolean;
  error?: string;
};

async function checkAsset(url: string): Promise<AssetCheck> {
  try {
    // Prefer HEAD, but some static hosts might not support it consistently.
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (res.ok) return { url, ok: true, status: res.status };
  } catch {
    // fall through to GET
  }

  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    return { url, ok: res.ok, status: res.status };
  } catch (e) {
    return { url, ok: false, error: e instanceof Error ? e.message : String(e) };
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

export function DiagnosticsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isIsolated = typeof window !== 'undefined' ? window.crossOriginIsolated : false;
  const hasSAB = typeof SharedArrayBuffer !== 'undefined';

  const assetUrls = useMemo(
    () => {
      const base = import.meta.env.BASE_URL || '/';
      return [
        `${base}ffmpeg/ffmpeg-core.js`,
        `${base}ffmpeg/ffmpeg-core.wasm`,
        `${base}ffmpeg/ffmpeg-core.worker.js`,
      ];
    },
    []
  );

  const [assets, setAssets] = useState<AssetCheck[] | null>(null);
  const [worker, setWorker] = useState<WorkerCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsChecking(true);
    setAssets(null);
    setWorker(null);

    (async () => {
      const assetChecks = await Promise.all(assetUrls.map(checkAsset));
      const workerCheck = await checkTranscriptionWorker();
      if (cancelled) return;
      setAssets(assetChecks);
      setWorker(workerCheck);
      setIsChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [assetUrls, open]);

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
                    <span className="truncate">{a.url}</span>
                    <span className={a.ok ? 'text-green-600' : 'text-destructive'}>
                      {a.ok ? `OK${a.status ? ` (${a.status})` : ''}` : `FAIL${a.status ? ` (${a.status})` : ''}`}
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
