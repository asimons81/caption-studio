import { useCallback, useState } from 'react';
import type { DragEvent } from 'react';
import { Upload, Film } from 'lucide-react';
import clsx from 'clsx';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  selectedFile?: File | null;
}

export function DropZone({ onFileSelect, accept = 'video/*', selectedFile }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFileSelect(e.target.files[0]);
      }
    },
    [onFileSelect]
  );

  if (selectedFile) {
    return (
      <div
        className={clsx(
          'relative flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-4',
          'cursor-pointer hover:border-primary/40 transition-colors',
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15">
          <Film className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB — click to change
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-all duration-150',
        isDragging
          ? 'border-primary bg-primary/8 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-surface-2 cursor-pointer',
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />

      <div className={clsx(
        'flex h-14 w-14 items-center justify-center rounded-xl border border-border transition-all duration-150',
        isDragging ? 'border-primary bg-primary/15' : 'bg-surface-3',
      )}>
        <Upload className={clsx(
          'h-6 w-6 transition-colors duration-150',
          isDragging ? 'text-primary' : 'text-muted-foreground',
        )} />
      </div>

      <p className="mt-4 text-sm font-medium">
        {isDragging ? 'Drop to upload' : 'Drop video here'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">or click to browse files</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        {['MP4', 'WebM', 'MOV', 'AVI'].map((fmt) => (
          <span
            key={fmt}
            className="rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            {fmt}
          </span>
        ))}
      </div>
    </div>
  );
}
