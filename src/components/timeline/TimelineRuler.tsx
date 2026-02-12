import { useTimeline } from '../../hooks/useTimeline';
import { formatTime } from '../../lib/video/videoUtils';

export function TimelineRuler() {
  const { duration, timeToPixels } = useTimeline();

  if (!duration) return null;

  const totalWidth = timeToPixels(duration);
  const markers: Array<{ time: number; label: string }> = [];

  // Generate time markers every second
  for (let time = 0; time <= duration; time += 1) {
    markers.push({ time, label: formatTime(time) });
  }

  return (
    <div className="relative h-8 border-b bg-muted/30" style={{ width: totalWidth }}>
      {markers.map(({ time, label }) => {
        const left = timeToPixels(time);
        const isSecond = time % 1 === 0;
        const showLabel = time % 5 === 0; // Show label every 5 seconds

        return (
          <div
            key={time}
            className="absolute top-0"
            style={{ left: `${left}px` }}
          >
            <div
              className={`border-l border-border ${
                isSecond ? 'h-3' : 'h-2'
              }`}
            />
            {showLabel && (
              <span className="absolute left-1 top-3 text-xs text-muted-foreground">
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
