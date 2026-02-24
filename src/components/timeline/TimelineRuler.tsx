import { useTimeline } from '../../hooks/useTimeline';
import { formatTime } from '../../lib/video/videoUtils';

export function TimelineRuler() {
  const { duration, timeToPixels, pixelsPerSecond } = useTimeline();

  if (!duration) return null;

  const totalWidth = timeToPixels(duration);

  // Decide label interval based on zoom level
  const labelInterval = pixelsPerSecond >= 80 ? 1 : pixelsPerSecond >= 30 ? 5 : 10;
  // Minor tick every second, major tick at label interval
  const minorInterval = pixelsPerSecond >= 40 ? 0.5 : 1;

  const ticks: Array<{ time: number; isMajor: boolean; showLabel: boolean }> = [];
  for (let t = 0; t <= duration + 0.01; t += minorInterval) {
    const rounded = Math.round(t * 100) / 100;
    const isExact = Math.abs(rounded % 1) < 0.01;
    const isMajor = isExact && Math.abs(rounded % labelInterval) < 0.01;
    ticks.push({ time: rounded, isMajor, showLabel: isMajor });
  }

  return (
    <div
      className="relative h-7 bg-surface-2 border-b border-border select-none shrink-0"
      style={{ width: `${totalWidth}px`, minWidth: '100%' }}
    >
      {ticks.map(({ time, isMajor, showLabel }) => {
        const left = timeToPixels(time);
        return (
          <div
            key={time}
            className="absolute top-0"
            style={{ left: `${left}px` }}
          >
            <div
              className="border-l border-border/60"
              style={{ height: isMajor ? '10px' : '5px' }}
            />
            {showLabel && (
              <span className="absolute top-2.5 left-1 text-[10px] font-mono text-muted-foreground tabular-nums whitespace-nowrap">
                {formatTime(time)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
