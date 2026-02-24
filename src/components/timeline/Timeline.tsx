import { useRef } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { videoFileAtom } from '../../atoms/videoAtoms';
import { timelineZoomAtom } from '../../atoms/uiAtoms';
import { useVideoPlayback } from '../../hooks/useVideoPlayback';
import { useTimeline } from '../../hooks/useTimeline';
import { TimelineRuler } from './TimelineRuler';
import { CaptionTrack } from './CaptionTrack';
import { Playhead } from './Playhead';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

export function Timeline() {
  const videoFile = useAtomValue(videoFileAtom);
  const { seek } = useVideoPlayback();
  const { pixelsToTime } = useTimeline();
  const [zoom, setZoom] = useAtom(timelineZoomAtom);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.5, 8));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.5, 0.25));

  if (!videoFile) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-xs text-muted-foreground">No video loaded</p>
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const time = pixelsToTime(x);
    seek(time);
  };

  return (
    <div className="flex flex-col">
      {/* Timeline header bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface-2 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Captions
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content="Zoom out" side="top">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              disabled={zoom <= 0.25}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <span className="font-mono text-xs text-muted-foreground w-8 text-center tabular-nums">
            {zoom < 1 ? `${Math.round(zoom * 100)}%` : `${zoom.toFixed(zoom % 1 === 0 ? 0 : 1)}×`}
          </span>
          <Tooltip content="Zoom in" side="top">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              disabled={zoom >= 8}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Timeline scroll area */}
      <div
        ref={containerRef}
        className="relative h-32 overflow-x-auto overflow-y-hidden cursor-crosshair"
        onClick={handleClick}
      >
        <div className="relative min-w-full">
          <TimelineRuler />
          <div className="relative">
            <Playhead />
            <CaptionTrack />
          </div>
        </div>
      </div>
    </div>
  );
}
