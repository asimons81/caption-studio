import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { FileText, FileCode, Video, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { captionSegmentsAtom, globalStyleAtom } from '../../atoms/captionAtoms';
import { videoFileAtom } from '../../atoms/videoAtoms';
import { downloadSRT } from '../../lib/export/srtParser';
import { downloadASS } from '../../lib/export/assGenerator';
import { useExport, type ExportQuality } from '../../hooks/useExport';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { ProgressBar } from '../ui/ProgressBar';
import clsx from 'clsx';

function ExportCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function ExportTab() {
  const segments = useAtomValue(captionSegmentsAtom);
  const style = useAtomValue(globalStyleAtom);
  const videoFile = useAtomValue(videoFileAtom);
  const [quality, setQuality] = useState<ExportQuality>('balanced');

  const { isExporting, progress, error, exportedBlob, startExport, cancelExport, downloadExport } =
    useExport();

  const handleDownloadSRT = () => {
    if (segments.length === 0) {
      toast.error('No captions to export');
      return;
    }

    const filename = videoFile
      ? videoFile.file.name.replace(/\.[^/.]+$/, '') + '.srt'
      : 'captions.srt';

    downloadSRT(segments, filename);
    toast.success('SRT file downloaded');
  };

  const handleDownloadASS = () => {
    if (segments.length === 0 || !videoFile) {
      toast.error('No captions or video loaded');
      return;
    }

    const filename = videoFile.file.name.replace(/\.[^/.]+$/, '') + '.ass';
    downloadASS(segments, style, videoFile.width, videoFile.height, filename);
    toast.success('ASS file downloaded');
  };

  const handleExportVideo = () => {
    startExport(quality);
  };

  const handleDownloadVideo = () => {
    if (videoFile) {
      const filename = videoFile.file.name.replace(/\.[^/.]+$/, '') + '-captions.mp4';
      downloadExport(filename);
    } else {
      downloadExport();
    }
  };

  const captionCount = segments.length;

  return (
    <div className="h-full overflow-y-auto bg-surface-1">
      {/* Header */}
      <div className="border-b border-border px-4 py-2.5 flex items-center justify-between shrink-0">
        <span className="text-sm font-medium">Export</span>
        <span className={clsx(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          captionCount > 0
            ? 'bg-success/15 text-success'
            : 'bg-surface-3 text-muted-foreground',
        )}>
          {captionCount} caption{captionCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* SRT */}
        <ExportCard
          icon={<FileText className="h-4 w-4" />}
          title="SRT Subtitle File"
          description="Universal format — works with YouTube, VLC, and most players"
          action={
            <Button
              onClick={handleDownloadSRT}
              disabled={captionCount === 0}
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<Download className="h-3.5 w-3.5" />}
            >
              Download .srt
            </Button>
          }
        />

        {/* ASS */}
        <ExportCard
          icon={<FileCode className="h-4 w-4" />}
          title="ASS Subtitle File"
          description="Advanced format — preserves all styling, colors and animations"
          action={
            <Button
              onClick={handleDownloadASS}
              disabled={captionCount === 0 || !videoFile}
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<Download className="h-3.5 w-3.5" />}
            >
              Download .ass
            </Button>
          }
        />

        {/* Video export */}
        <div className="rounded-lg border border-border bg-surface-2 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground shrink-0">
              <Video className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Burned-in Video</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently embed captions — processed entirely in your browser
              </p>
            </div>
          </div>

          {!isExporting && !exportedBlob && (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Quality</label>
                <Select value={quality} onValueChange={(v) => setQuality(v as ExportQuality)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast — Lower quality, smaller file</SelectItem>
                    <SelectItem value="balanced">Balanced — Recommended</SelectItem>
                    <SelectItem value="high">High — Best quality, larger file</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleExportVideo}
                disabled={captionCount === 0 || !videoFile}
                size="sm"
                className="w-full"
                icon={<Video className="h-3.5 w-3.5" />}
              >
                Export Video with Captions
              </Button>

              {!videoFile && (
                <p className="flex items-center gap-1.5 text-xs text-warning">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Upload a video first
                </p>
              )}
              {captionCount === 0 && videoFile && (
                <p className="flex items-center gap-1.5 text-xs text-warning">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Add captions before exporting
                </p>
              )}
            </div>
          )}

          {isExporting && (
            <div className="space-y-3">
              <ProgressBar value={progress.progress} label={progress.message} />
              <Button onClick={cancelExport} variant="destructive" size="sm" className="w-full">
                Cancel Export
              </Button>
              <p className="text-xs text-muted-foreground">
                Processing in your browser — this may take several minutes.
              </p>
            </div>
          )}

          {exportedBlob && !isExporting && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-md bg-success/10 border border-success/20 px-3 py-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                <div>
                  <p className="text-xs font-medium text-success">Export complete</p>
                  <p className="text-xs text-muted-foreground">
                    {(exportedBlob.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <Button
                onClick={handleDownloadVideo}
                size="sm"
                className="w-full"
                icon={<Download className="h-3.5 w-3.5" />}
              >
                Download Video
              </Button>

              <Button
                onClick={() => startExport(quality)}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Export Again
              </Button>
            </div>
          )}

          {error && !isExporting && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-destructive">Export failed</p>
                <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
                <p className="text-xs text-muted-foreground">Chrome or Edge recommended.</p>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Tips</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• SRT works with VLC, YouTube, and most players</li>
            <li>• ASS preserves all styling and animations</li>
            <li>• Close other tabs during video export for better performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
