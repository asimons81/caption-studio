import { useTimeline } from '../../hooks/useTimeline';

export function Playhead() {
  const { currentTime, timeToPixels } = useTimeline();

  const left = timeToPixels(currentTime);

  return (
    <div
      className="pointer-events-none absolute top-0 z-10 h-full w-0.5 bg-primary"
      style={{ left: `${left}px` }}
    >
      <div className="absolute -left-1.5 -top-1 h-3 w-3 rounded-full bg-primary" />
    </div>
  );
}
