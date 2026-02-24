import { useState, useRef, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { Trash2 } from 'lucide-react';
import type { CaptionSegment } from '../../types/caption';
import { captionSegmentsAtom, selectedSegmentIdAtom } from '../../atoms/captionAtoms';
import { updateSegment, removeSegment } from '../../lib/caption/captionUtils';
import { formatTimeInput, parseTimeString } from '../../lib/caption/timingUtils';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import clsx from 'clsx';

interface CaptionSegmentRowProps {
  segment: CaptionSegment;
  isSelected: boolean;
  isActive: boolean;
}

export function CaptionSegmentRow({ segment, isSelected, isActive }: CaptionSegmentRowProps) {
  const setSegments = useSetAtom(captionSegmentsAtom);
  const setSelectedId = useSetAtom(selectedSegmentIdAtom);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(segment.text);
  const [startTimeStr, setStartTimeStr] = useState(formatTimeInput(segment.startTime));
  const [endTimeStr, setEndTimeStr] = useState(formatTimeInput(segment.endTime));
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditText(segment.text);
    setStartTimeStr(formatTimeInput(segment.startTime));
    setEndTimeStr(formatTimeInput(segment.endTime));
  }, [segment]);

  useEffect(() => {
    if (isEditingText && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, [isEditingText]);

  const handleTextSave = () => {
    setIsEditingText(false);
    if (editText.trim() !== segment.text) {
      setSegments((prev) => updateSegment(prev, segment.id, { text: editText.trim() }));
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSave();
    } else if (e.key === 'Escape') {
      setEditText(segment.text);
      setIsEditingText(false);
    }
  };

  const handleStartTimeBlur = () => {
    const newTime = parseTimeString(startTimeStr);
    if (newTime !== null && newTime !== segment.startTime) {
      setSegments((prev) => updateSegment(prev, segment.id, { startTime: newTime }));
    }
    setStartTimeStr(formatTimeInput(segment.startTime));
  };

  const handleEndTimeBlur = () => {
    const newTime = parseTimeString(endTimeStr);
    if (newTime !== null && newTime !== segment.endTime) {
      setSegments((prev) => updateSegment(prev, segment.id, { endTime: newTime }));
    }
    setEndTimeStr(formatTimeInput(segment.endTime));
  };

  const handleDelete = () => {
    setSegments((prev) => removeSegment(prev, segment.id));
  };

  const handleClick = () => {
    setSelectedId(segment.id);
  };

  return (
    <div
      className={clsx(
        'group relative px-3 py-2.5 transition-colors cursor-pointer',
        isActive && 'bg-primary/8',
        isSelected && !isActive && 'bg-surface-3',
        !isActive && !isSelected && 'hover:bg-surface-2',
      )}
      onClick={handleClick}
    >
      {/* Active indicator bar */}
      {(isActive || isSelected) && (
        <div className={clsx(
          'absolute left-0 top-0 h-full w-0.5 rounded-r-full',
          isActive ? 'bg-primary' : 'bg-surface-4',
        )} />
      )}

      {/* Time inputs row */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <input
          type="text"
          value={startTimeStr}
          onChange={(e) => setStartTimeStr(e.target.value)}
          onBlur={handleStartTimeBlur}
          className={clsx(
            'w-20 rounded border border-border bg-surface-2 px-1.5 py-0.5',
            'font-mono text-xs text-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
          )}
          onClick={(e) => e.stopPropagation()}
        />
        <span className="text-xs text-muted-foreground shrink-0">→</span>
        <input
          type="text"
          value={endTimeStr}
          onChange={(e) => setEndTimeStr(e.target.value)}
          onBlur={handleEndTimeBlur}
          className={clsx(
            'w-20 rounded border border-border bg-surface-2 px-1.5 py-0.5',
            'font-mono text-xs text-foreground',
            'focus:outline-none focus:ring-1 focus:ring-ring',
          )}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="flex-1" />
        <Tooltip content="Delete caption" side="left">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className={clsx(
              'h-6 w-6 transition-opacity',
              'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
              'opacity-0 group-hover:opacity-100',
              isSelected && 'opacity-60',
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>

      {/* Caption text */}
      {isEditingText ? (
        <textarea
          ref={textAreaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleTextSave}
          onKeyDown={handleTextKeyDown}
          className={clsx(
            'w-full rounded border border-border bg-surface-2 px-2 py-1',
            'text-sm text-foreground leading-snug resize-none',
            'focus:outline-none focus:ring-1 focus:ring-ring',
          )}
          rows={2}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p
          className={clsx(
            'text-sm leading-snug cursor-text',
            isActive ? 'text-foreground font-medium' : 'text-foreground/80',
            !segment.text && 'text-muted-foreground italic',
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsEditingText(true);
          }}
        >
          {segment.text || '(click to edit)'}
        </p>
      )}
    </div>
  );
}
