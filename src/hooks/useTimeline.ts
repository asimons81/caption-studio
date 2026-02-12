import { useAtomValue } from 'jotai';
import { playbackStateAtom } from '../atoms/videoAtoms';
import { timelineZoomAtom } from '../atoms/uiAtoms';

export function useTimeline() {
  const playback = useAtomValue(playbackStateAtom);
  const zoom = useAtomValue(timelineZoomAtom);

  // Calculate pixel per second based on zoom
  const pixelsPerSecond = 50 * zoom;

  // Convert time to pixel position
  const timeToPixels = (time: number): number => {
    return time * pixelsPerSecond;
  };

  // Convert pixel position to time
  const pixelsToTime = (pixels: number): number => {
    return pixels / pixelsPerSecond;
  };

  return {
    duration: playback.duration,
    currentTime: playback.currentTime,
    zoom,
    pixelsPerSecond,
    timeToPixels,
    pixelsToTime,
  };
}
