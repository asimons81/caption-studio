import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { captionSegmentsAtom, globalStyleAtom } from '../../atoms/captionAtoms';
import { videoFileAtom } from '../../atoms/videoAtoms';
import { downloadSRT } from '../../lib/export/srtParser';
import { downloadASS } from '../../lib/export/assGenerator';
import { useExport, type ExportQuality } from '../../hooks/useExport';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { ProgressBar } from '../ui/ProgressBar';

export function ExportTab() {
  const segments = useAtomValue(captionSegmentsAtom);
  const style = useAtomValue(globalStyleAtom);
  const videoFile = useAtomValue(videoFileAtom);
  const [quality, setQuality] = useState<ExportQuality>('balanced');

  const { isExporting, progress, error, exportedBlob, startExport, cancelExport, downloadExport } =
    useExport();

  const handleDownloadSRT = () => {
    if (segments.length === 0) {
      alert('No captions to export');
      return;
    }

    const filename = videoFile
      ? videoFile.file.name.replace(/\.[^/.]+$/, '') + '.srt'
      : 'captions.srt';

    downloadSRT(segments, filename);
  };

  const handleDownloadASS = () => {
    if (segments.length === 0 || !videoFile) {
      alert('No captions or video to export');
      return;
    }

    const filename = videoFile.file.name.replace(/\.[^/.]+$/, '') + '.ass';
    downloadASS(segments, style, videoFile.width, videoFile.height, filename);
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

  return (
    <div className="h-full space-y-6 overflow-y-auto p-4">
      {/* Subtitle Files */}
      <section>
        <h3 className="mb-2 font-semibold">Export Subtitle Files</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Download caption files to use in other video players or editors.
        </p>

        <div className="space-y-2">
          <Button onClick={handleDownloadSRT} disabled={segments.length === 0} className="w-full">
            Download SRT File
          </Button>

          <Button
            onClick={handleDownloadASS}
            disabled={segments.length === 0 || !videoFile}
            variant="secondary"
            className="w-full"
          >
            Download ASS File
          </Button>

          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium">
              {segments.length} caption{segments.length !== 1 ? 's' : ''} ready to export
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              SRT: Universal format • ASS: Advanced styling
            </p>
          </div>
        </div>
      </section>

      {/* Video Export */}
      <section>
        <h3 className="mb-2 font-semibold">Export Video with Burned Captions</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently embed captions into your video. Processing happens entirely in your browser.
        </p>

        {!isExporting && !exportedBlob && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Quality</label>
              <Select value={quality} onValueChange={(v) => setQuality(v as ExportQuality)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast (Lower quality, smaller file)</SelectItem>
                  <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                  <SelectItem value="high">High (Best quality, larger file)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExportVideo}
              disabled={segments.length === 0 || !videoFile}
              className="w-full"
            >
              Export Video with Captions
            </Button>

            {!videoFile && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-500">
                <p className="font-medium">⚠️ No video loaded</p>
                <p className="mt-1 text-xs">Upload a video first to export</p>
              </div>
            )}

            {segments.length === 0 && videoFile && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-500">
                <p className="font-medium">⚠️ No captions added</p>
                <p className="mt-1 text-xs">Add captions before exporting</p>
              </div>
            )}
          </div>
        )}

        {isExporting && (
          <div className="space-y-4">
            <ProgressBar value={progress.progress} label={progress.message} />
            <Button onClick={cancelExport} variant="destructive" className="w-full">
              Cancel Export
            </Button>
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p>
                This may take several minutes depending on video length and your device performance.
              </p>
            </div>
          </div>
        )}

        {exportedBlob && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-500">
              <p className="font-medium">✓ Export complete!</p>
              <p className="mt-1 text-xs">
                Video size: {(exportedBlob.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <Button onClick={handleDownloadVideo} className="w-full">
              Download Video
            </Button>

            <Button
              onClick={() => {
                startExport(quality);
              }}
              variant="secondary"
              className="w-full"
            >
              Export Again
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">Error: {error}</p>
            <p className="mt-1 text-xs">
              Make sure your browser supports FFmpeg.wasm. Chrome/Edge recommended.
            </p>
          </div>
        )}
      </section>

      {/* Tips */}
      <section>
        <h3 className="mb-2 font-semibold">Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• SRT files work with VLC, YouTube, and most video players</li>
          <li>• ASS files preserve all styling (colors, fonts, animations)</li>
          <li>• Video export processes entirely in your browser (no upload)</li>
          <li>• Larger videos take longer to process - be patient!</li>
          <li>• Close other tabs during export for better performance</li>
        </ul>
      </section>
    </div>
  );
}
