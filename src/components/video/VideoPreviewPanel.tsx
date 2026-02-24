import { useCallback, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Clapperboard, Upload } from 'lucide-react';
import { videoFileAtom } from '../../atoms/videoAtoms';
import { isUploadModalOpenAtom } from '../../atoms/uiAtoms';
import { VideoPlayer } from './VideoPlayer';
import { PlaybackControls } from './PlaybackControls';
import { Button } from '../ui/Button';
import clsx from 'clsx';

function EmptyState() {
  const setIsUploadModalOpen = useSetAtom(isUploadModalOpenAtom);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsUploadModalOpen(true);
  }, [setIsUploadModalOpen]);

  return (
    <div
      className={clsx(
        'flex h-full w-full flex-col items-center justify-center gap-6 p-8 transition-all duration-200',
        'cursor-pointer',
        isDragOver && 'bg-primary/5',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => setIsUploadModalOpen(true)}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-foreground) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative flex flex-col items-center gap-6 max-w-sm text-center">
        {/* Icon */}
        <div className={clsx(
          'flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-200',
          'border-2 border-dashed border-border bg-surface-2',
          isDragOver && 'border-primary bg-primary/10 scale-105',
        )}>
          <Clapperboard className={clsx(
            'h-9 w-9 transition-colors duration-200',
            isDragOver ? 'text-primary' : 'text-muted-foreground',
          )} />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold text-foreground">
            {isDragOver ? 'Drop to upload' : 'Drop your video here'}
          </h2>
          <p className="text-sm text-muted-foreground">
            or click anywhere to browse files
          </p>
        </div>

        {/* Format chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {['MP4', 'WebM', 'MOV', 'AVI'].map((fmt) => (
            <span
              key={fmt}
              className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted-foreground"
            >
              {fmt}
            </span>
          ))}
        </div>

        <Button
          size="md"
          icon={<Upload className="h-4 w-4" />}
          onClick={(e) => {
            e.stopPropagation();
            setIsUploadModalOpen(true);
          }}
        >
          Choose File
        </Button>
      </div>
    </div>
  );
}

export function VideoPreviewPanel() {
  const videoFile = useAtomValue(videoFileAtom);

  if (!videoFile) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <VideoPlayer />
      </div>
      <PlaybackControls />
    </div>
  );
}
