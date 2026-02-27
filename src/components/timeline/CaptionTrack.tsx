import { useState, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { captionSegmentsAtom, selectedSegmentIdAtom, activeCaptionsAtom } from '../../atoms/captionAtoms';
import { updateSegment } from '../../lib/caption/captionUtils';
import { useTimeline } from '../../hooks/useTimeline';
import clsx from 'clsx';

export function CaptionTrack() {
  const [segments, setSegments] = useAtom(captionSegmentsAtom);
  const [selectedId, setSelectedId] = useAtom(selectedSegmentIdAtom);
  const activeCaptions = useAtomValue(activeCaptionsAtom);
  const { timeToPixels, pixelsToTime, duration } = useTimeline();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<{ id: string; edge: 'start' | 'end' } | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [originalTimes, setOriginalTimes] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  const activeIds = new Set(activeCaptions.map((c) => c.id));

  useEffect(() => {
    if (!draggingId && !resizingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      const deltaTime = pixelsToTime(deltaX);

      if (draggingId) {
        const segment = segments.find((s) => s.id === draggingId);
        if (!segment) return;

        const dur = segment.endTime - segment.startTime;
        const newStart = Math.max(0, Math.min(originalTimes.start + deltaTime, duration - dur));
        const newEnd = newStart + dur;

        setSegments((prev) =>
          updateSegment(prev, draggingId, { startTime: newStart, endTime: newEnd })
        );
      } else if (resizingId) {
        const segment = segments.find((s) => s.id === resizingId.id);
        if (!segment) return;

        if (resizingId.edge === 'start') {
          const newStart = Math.max(0, Math.min(originalTimes.start + deltaTime, segment.endTime - 0.1));
          setSegments((prev) => updateSegment(prev, resizingId.id, { startTime: newStart }));
        } else {
          const newEnd = Math.max(segment.startTime + 0.1, Math.min(originalTimes.end + deltaTime, duration));
          setSegments((prev) => updateSegment(prev, resizingId.id, { endTime: newEnd }));
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setResizingId(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, resizingId, dragStartX, originalTimes, segments, setSegments, pixelsToTime, duration]);

  const handleSegmentMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const segment = segments.find((s) => s.id === id);
    if (!segment) return;

    setDraggingId(id);
    setDragStartX(e.clientX);
    setOriginalTimes({ start: segment.startTime, end: segment.endTime });
    setSelectedId(id);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: string, edge: 'start' | 'end') => {
    e.stopPropagation();
    const segment = segments.find((s) => s.id === id);
    if (!segment) return;

    setResizingId({ id, edge });
    setDragStartX(e.clientX);
    setOriginalTimes({ start: segment.startTime, end: segment.endTime });
  };

  if (!duration) return null;

  const totalWidth = timeToPixels(duration);

  return (
    <div className="relative h-[88px]" style={{ width: `${totalWidth}px`, minWidth: '100%' }}>
      {/* Track background */}
      <div className="absolute inset-0 border-b border-border/30" />

      {segments.map((segment) => {
        const left = timeToPixels(segment.startTime);
        const width = Math.max(timeToPixels(segment.endTime - segment.startTime), 4);
        const isSelected = segment.id === selectedId;
        const isActive = activeIds.has(segment.id);

        return (
          <div
            key={segment.id}
            className={clsx(
              'absolute top-3 h-14 cursor-move rounded-md overflow-hidden',
              'border transition-all duration-75 group',
              isSelected && 'border-primary bg-primary/25 shadow-sm shadow-primary/20 z-10',
              isActive && !isSelected && 'border-primary/60 bg-primary/15 z-10',
              !isSelected && !isActive && 'border-border bg-surface-3/80 hover:border-primary/40 hover:bg-surface-4',
            )}
            style={{ left: `${left}px`, width: `${width}px` }}
            onMouseDown={(e) => handleSegmentMouseDown(e, segment.id)}
          >
            {/* Left resize handle */}
            <div
              className={clsx(
                'absolute left-0 top-0 h-full w-2 cursor-ew-resize z-20',
                'transition-colors hover:bg-primary/40',
                (isSelected || isActive) && 'bg-primary/20',
              )}
              onMouseDown={(e) => handleResizeMouseDown(e, segment.id, 'start')}
            />

            {/* Caption text */}
            <div className="pointer-events-none overflow-hidden px-3 py-1.5">
              <p className={clsx(
                'text-xs font-medium leading-tight truncate',
                isSelected || isActive ? 'text-foreground' : 'text-muted-foreground',
              )}>
                {segment.text || '(empty)'}
              </p>
            </div>

            {/* Right resize handle */}
            <div
              className={clsx(
                'absolute right-0 top-0 h-full w-2 cursor-ew-resize z-20',
                'transition-colors hover:bg-primary/40',
                (isSelected || isActive) && 'bg-primary/20',
              )}
              onMouseDown={(e) => handleResizeMouseDown(e, segment.id, 'end')}
            />
          </div>
        );
      })}
    </div>
  );
}
