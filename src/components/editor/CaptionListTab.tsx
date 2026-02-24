import { useState, useRef, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Plus, FileText, Mic, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  captionSegmentsAtom,
  selectedSegmentIdAtom,
  activeCaptionsAtom,
} from '../../atoms/captionAtoms';
import { playbackStateAtom, videoFileAtom } from '../../atoms/videoAtoms';
import { addSegment } from '../../lib/caption/captionUtils';
import { parseSRT } from '../../lib/export/srtParser';
import { useTranscription, type TranscriptionModel } from '../../hooks/useTranscription';
import { CaptionSegmentRow } from './CaptionSegmentRow';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { Tooltip } from '../ui/Tooltip';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { autoTranscribeOnImportAtom } from '../../atoms/settingsAtoms';
import { DiagnosticsModal } from '../diagnostics/DiagnosticsModal';

export function CaptionListTab() {
  const [segments, setSegments] = useAtom(captionSegmentsAtom);
  const selectedId = useAtomValue(selectedSegmentIdAtom);
  const activeCaptions = useAtomValue(activeCaptionsAtom);
  const playback = useAtomValue(playbackStateAtom);
  const videoFile = useAtomValue(videoFileAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isTranscribeModalOpen, setIsTranscribeModalOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<TranscriptionModel>('tiny');
  const [autoTranscribeOnImport, setAutoTranscribeOnImport] = useAtom(autoTranscribeOnImportAtom);
  const { isTranscribing, progress, error, debugDetails, startTranscription, cancelTranscription } = useTranscription();

  const autoRunKeyRef = useRef<string | null>(null);
  const isIsolated = typeof window !== 'undefined' ? window.crossOriginIsolated : true;

  const activeIds = new Set(activeCaptions.map((c) => c.id));

  // Auto-scroll to active caption
  useEffect(() => {
    if (activeCaptions.length > 0 && containerRef.current) {
      const activeElement = containerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeCaptions]);

  // Auto-start transcription after video import
  useEffect(() => {
    if (!videoFile) return;
    if (!autoTranscribeOnImport) return;
    if (isTranscribing) return;
    if (segments.length > 0) return;

    const key = `${videoFile.file.name}:${videoFile.file.size}:${videoFile.file.lastModified}`;
    if (autoRunKeyRef.current === key) return;
    autoRunKeyRef.current = key;

    startTranscription(selectedModel);
  }, [autoTranscribeOnImport, isTranscribing, segments.length, selectedModel, startTranscription, videoFile]);

  const handleAddSegment = () => {
    const startTime = playback.currentTime;
    const endTime = Math.min(startTime + 3, playback.duration);
    setSegments((prev) => addSegment(prev, 'New caption', startTime, endTime));
  };

  const handleImportSRT = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseSRT(text);
      setSegments(imported);
      toast.success(`Imported ${imported.length} captions`);
    } catch {
      toast.error('Failed to import SRT file');
    }

    e.target.value = '';
  };

  const handleStartTranscription = () => {
    setIsTranscribeModalOpen(false);
    startTranscription(selectedModel);
  };

  const handleRetryTranscription = () => {
    if (!videoFile || isTranscribing) return;
    autoRunKeyRef.current = null;
    startTranscription(selectedModel);
  };

  return (
    <div className="flex h-full flex-col bg-surface-1">
      {/* COOP/COEP warning */}
      {!isIsolated && (
        <div className="border-b border-border p-3 shrink-0">
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
            <div className="text-sm font-medium text-destructive">Cross-origin isolation missing</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Transcription requires COOP/COEP headers.
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => setIsDiagnosticsOpen(true)}
            >
              Open Diagnostics
            </Button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 shrink-0">
        <Tooltip content="Add caption at current time" side="bottom">
          <Button
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={handleAddSegment}
          >
            Add
          </Button>
        </Tooltip>

        <Tooltip content="Import SRT file" side="bottom">
          <Button
            size="sm"
            variant="secondary"
            icon={<FileText className="h-3.5 w-3.5" />}
            onClick={handleImportSRT}
          >
            Import
          </Button>
        </Tooltip>

        <Tooltip content={!videoFile ? 'Load a video first' : 'Auto-transcribe audio'} side="bottom">
          <Button
            size="sm"
            variant="secondary"
            icon={<Mic className="h-3.5 w-3.5" />}
            onClick={() => setIsTranscribeModalOpen(true)}
            disabled={!videoFile || isTranscribing}
          >
            {isTranscribing ? 'Transcribing…' : 'Transcribe'}
          </Button>
        </Tooltip>

        <div className="flex-1" />

        <Tooltip content="Diagnostics" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDiagnosticsOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>

        <Switch
          checked={autoTranscribeOnImport}
          onCheckedChange={setAutoTranscribeOnImport}
          label="Auto"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".srt"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Transcription Progress */}
      {isTranscribing && (
        <div className="border-b border-border px-3 py-2 space-y-2 bg-surface-2 shrink-0">
          <ProgressBar
            value={progress.progress}
            label={`${progress.stage}: ${progress.message}`}
          />
          <Button
            size="sm"
            variant="destructive"
            onClick={cancelTranscription}
            className="w-full"
          >
            Cancel Transcription
          </Button>
        </div>
      )}

      {/* Error state */}
      {error && !isTranscribing && (
        <div className="border-b border-border px-3 py-2 shrink-0">
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <div className="text-sm font-medium text-destructive">Transcription failed</div>
            <div className="mt-1 text-xs text-muted-foreground">{error}</div>
            {videoFile && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={handleRetryTranscription}
                disabled={isTranscribing}
              >
                Retry
              </Button>
            )}
            {debugDetails && (
              <details className="mt-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer select-none">Debug details</summary>
                <pre className="mt-1 whitespace-pre-wrap break-words rounded bg-surface-3 p-2 text-xs overflow-auto max-h-32">
                  {debugDetails}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Caption list */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {segments.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-3">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No captions yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add manually, import an SRT file, or auto-transcribe
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddSegment}
                icon={<Plus className="h-3.5 w-3.5" />}
              >
                Add manually
              </Button>
              {videoFile && (
                <Button
                  size="sm"
                  onClick={() => setIsTranscribeModalOpen(true)}
                  disabled={isTranscribing}
                  icon={<Mic className="h-3.5 w-3.5" />}
                >
                  Transcribe
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {segments.map((segment) => (
              <div key={segment.id} data-active={activeIds.has(segment.id)}>
                <CaptionSegmentRow
                  segment={segment}
                  isSelected={segment.id === selectedId}
                  isActive={activeIds.has(segment.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: caption count */}
      {segments.length > 0 && (
        <div className="border-t border-border px-3 py-1.5 shrink-0">
          <span className="text-xs text-muted-foreground">
            {segments.length} caption{segments.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Transcription Modal */}
      <Modal open={isTranscribeModalOpen} onOpenChange={setIsTranscribeModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Transcribe Audio</ModalTitle>
            <ModalDescription>
              Automatically generate captions using AI speech recognition.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Model
              </label>
              <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as TranscriptionModel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiny">Tiny (~40 MB) — Faster, less accurate</SelectItem>
                  <SelectItem value="small">Small (~240 MB) — Slower, more accurate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-border bg-surface-2 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Before you start:</p>
              <ul className="list-inside list-disc space-y-0.5">
                <li>First run will download the AI model</li>
                <li>Processing happens entirely in your browser</li>
                <li>This may take several minutes</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsTranscribeModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartTranscription}
                className="flex-1"
                icon={<Mic className="h-4 w-4" />}
              >
                Start Transcription
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      <DiagnosticsModal open={isDiagnosticsOpen} onOpenChange={setIsDiagnosticsOpen} />
    </div>
  );
}
