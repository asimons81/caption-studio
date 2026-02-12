import { useState, useRef, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
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
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

export function CaptionListTab() {
  const [segments, setSegments] = useAtom(captionSegmentsAtom);
  const selectedId = useAtomValue(selectedSegmentIdAtom);
  const activeCaptions = useAtomValue(activeCaptionsAtom);
  const playback = useAtomValue(playbackStateAtom);
  const videoFile = useAtomValue(videoFileAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isTranscribeModalOpen, setIsTranscribeModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<TranscriptionModel>('tiny');
  const { isTranscribing, progress, error, startTranscription, cancelTranscription } = useTranscription();

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
    } catch (error) {
      console.error('Failed to import SRT:', error);
      alert('Failed to import SRT file');
    }

    // Reset input
    e.target.value = '';
  };

  const handleStartTranscription = () => {
    setIsTranscribeModalOpen(false);
    startTranscription(selectedModel);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header actions */}
      <div className="flex flex-wrap gap-2 border-b p-4">
        <Button size="sm" onClick={handleAddSegment}>
          Add Caption
        </Button>
        <Button size="sm" variant="secondary" onClick={handleImportSRT}>
          Import SRT
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsTranscribeModalOpen(true)}
          disabled={!videoFile || isTranscribing}
        >
          {isTranscribing ? 'Transcribing...' : 'Transcribe'}
        </Button>
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
        <div className="border-b p-4 space-y-2">
          <ProgressBar value={progress.progress} label={progress.message} />
          <Button size="sm" variant="destructive" onClick={cancelTranscription} className="w-full">
            Cancel Transcription
          </Button>
        </div>
      )}

      {error && (
        <div className="border-b p-4">
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Error: {error}
          </div>
        </div>
      )}

      {/* Caption list */}
      <div ref={containerRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {segments.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <div>
              <p>No captions yet</p>
              <p className="text-sm">Add a caption or import an SRT file</p>
            </div>
          </div>
        ) : (
          segments.map((segment) => (
            <div key={segment.id} data-active={activeIds.has(segment.id)}>
              <CaptionSegmentRow
                segment={segment}
                isSelected={segment.id === selectedId}
                isActive={activeIds.has(segment.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Transcription Modal */}
      <Modal open={isTranscribeModalOpen} onOpenChange={setIsTranscribeModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Transcribe Audio</ModalTitle>
            <ModalDescription>
              Automatically generate captions from your video's audio using AI speech recognition.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Model</label>
              <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as TranscriptionModel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tiny">
                    Tiny (~40MB) - Faster, less accurate
                  </SelectItem>
                  <SelectItem value="small">
                    Small (~240MB) - Slower, more accurate
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p className="mb-2 font-medium">Note:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>First run will download the AI model</li>
                <li>Processing happens entirely in your browser</li>
                <li>Larger models provide better accuracy</li>
                <li>This may take several minutes</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsTranscribeModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleStartTranscription} className="flex-1">
                Start Transcription
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
