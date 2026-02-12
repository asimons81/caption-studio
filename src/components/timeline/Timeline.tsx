import { useRef } from 'react';
import { useAtomValue } from 'jotai';
import { videoFileAtom } from '../../atoms/videoAtoms';
import { useVideoPlayback } from '../../hooks/useVideoPlayback';
import { useTimeline } from '../../hooks/useTimeline';
import { TimelineRuler } from './TimelineRuler';
import { CaptionTrack } from './CaptionTrack';
import { Playhead } from './Playhead';

export function Timeline() {
  const videoFile = useAtomValue(videoFileAtom);
  const { seek } = useVideoPlayback();
  const { pixelsToTime } = useTimeline();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!videoFile) {
    return (
      <div className="flex h-32 items-center justify-center border-t bg-muted/30">
        <p className="text-sm text-muted-foreground">No video loaded</p>
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
    <div className="border-t bg-background">
      <div
        ref={containerRef}
        className="relative h-32 overflow-x-auto overflow-y-hidden"
        onClick={handleClick}
      >
        <div className="relative">
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
