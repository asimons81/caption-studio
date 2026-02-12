import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { captionSegmentsAtom, selectedSegmentIdAtom } from '../../atoms/captionAtoms';
import { updateSegment } from '../../lib/caption/captionUtils';
import { useTimeline } from '../../hooks/useTimeline';
import clsx from 'clsx';

export function CaptionTrack() {
  const [segments, setSegments] = useAtom(captionSegmentsAtom);
  const [selectedId, setSelectedId] = useAtom(selectedSegmentIdAtom);
  const { timeToPixels, pixelsToTime, duration } = useTimeline();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<{ id: string; edge: 'start' | 'end' } | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [originalTimes, setOriginalTimes] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  useEffect(() => {
    if (!draggingId && !resizingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      const deltaTime = pixelsToTime(deltaX);

      if (draggingId) {
        const segment = segments.find((s) => s.id === draggingId);
        if (!segment) return;

        const newStart = Math.max(0, Math.min(originalTimes.start + deltaTime, duration - (segment.endTime - segment.startTime)));
        const newEnd = newStart + (segment.endTime - segment.startTime);

        setSegments((prev) =>
          updateSegment(prev, draggingId, {
            startTime: newStart,
            endTime: newEnd,
          })
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
    <div className="relative h-16" style={{ width: totalWidth }}>
      {segments.map((segment) => {
        const left = timeToPixels(segment.startTime);
        const width = timeToPixels(segment.endTime - segment.startTime);
        const isSelected = segment.id === selectedId;

        return (
          <div
            key={segment.id}
            className={clsx(
              'absolute top-2 h-12 cursor-move rounded border-2 transition-colors',
              isSelected
                ? 'border-primary bg-primary/20 z-10'
                : 'border-accent bg-accent/40 hover:bg-accent/60'
            )}
            style={{
              left: `${left}px`,
              width: `${width}px`,
            }}
            onMouseDown={(e) => handleSegmentMouseDown(e, segment.id)}
          >
            {/* Resize handle - start */}
            <div
              className="absolute left-0 top-0 h-full w-2 cursor-ew-resize hover:bg-primary/50"
              onMouseDown={(e) => handleResizeMouseDown(e, segment.id, 'start')}
            />

            {/* Caption text */}
            <div className="pointer-events-none overflow-hidden px-2 py-1 text-xs">
              {segment.text.slice(0, 30)}
              {segment.text.length > 30 && '...'}
            </div>

            {/* Resize handle - end */}
            <div
              className="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-primary/50"
              onMouseDown={(e) => handleResizeMouseDown(e, segment.id, 'end')}
            />
          </div>
        );
      })}
    </div>
  );
}
