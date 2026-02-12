import { useEffect, useRef } from 'react';
import { useVideoPlayback } from '../../hooks/useVideoPlayback';
import { CaptionOverlay } from './CaptionOverlay';

export function VideoPlayer() {
  const { videoRef, setVideoRef } = useVideoPlayback();
  const elementRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      setVideoRef(elementRef.current);
    }
  }, [setVideoRef]);

  if (!videoRef) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <video
        ref={elementRef}
        src={videoRef}
        className="max-h-full max-w-full"
        controls={false}
      />
      <CaptionOverlay />
    </div>
  );
}
