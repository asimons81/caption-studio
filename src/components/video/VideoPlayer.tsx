import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { videoFileAtom } from '../../atoms/videoAtoms';
import { useVideoPlayback } from '../../hooks/useVideoPlayback';
import { CaptionOverlay } from './CaptionOverlay';

export function VideoPlayer() {
  const videoFile = useAtomValue(videoFileAtom);
  const { setVideoRef } = useVideoPlayback();
  const elementRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      setVideoRef(elementRef.current);
    }
  }, [setVideoRef]);

  if (!videoFile) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <video
        ref={elementRef}
        src={videoFile.url}
        className="max-h-full max-w-full"
        controls={false}
      />
      <CaptionOverlay />
    </div>
  );
}
