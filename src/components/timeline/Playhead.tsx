import { useTimeline } from '../../hooks/useTimeline';

export function Playhead() {
  const { currentTime, timeToPixels } = useTimeline();

  const left = timeToPixels(currentTime);

  return (
    <div
      className="pointer-events-none absolute top-0 z-20 h-full"
      style={{ left: `${left}px`, width: '2px', transform: 'translateX(-1px)' }}
    >
      {/* Diamond handle at top */}
      <div
        className="absolute -top-0.5 left-1/2 -translate-x-1/2"
        style={{
          width: '10px',
          height: '10px',
          background: 'hsl(0 80% 60%)',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
      />
      {/* Vertical line */}
      <div className="absolute top-2 left-0 w-full h-full bg-red-500/80" />
    </div>
  );
}
