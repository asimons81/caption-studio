import { useState, useRef, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import type { CaptionSegment } from '../../types/caption';
import { captionSegmentsAtom, selectedSegmentIdAtom } from '../../atoms/captionAtoms';
import { updateSegment, removeSegment } from '../../lib/caption/captionUtils';
import { formatTimeInput, parseTimeString } from '../../lib/caption/timingUtils';
import { Button } from '../ui/Button';
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
        'rounded-lg border p-3 transition-colors',
        isActive && 'border-primary bg-primary/5',
        isSelected && !isActive && 'border-accent bg-accent/5',
        !isActive && !isSelected && 'border-border hover:border-accent'
      )}
      onClick={handleClick}
    >
      {/* Time inputs */}
      <div className="mb-2 flex gap-2 text-xs">
        <input
          type="text"
          value={startTimeStr}
          onChange={(e) => setStartTimeStr(e.target.value)}
          onBlur={handleStartTimeBlur}
          className="w-24 rounded border border-input bg-background px-2 py-1 font-mono"
          onClick={(e) => e.stopPropagation()}
        />
        <span className="flex items-center text-muted-foreground">→</span>
        <input
          type="text"
          value={endTimeStr}
          onChange={(e) => setEndTimeStr(e.target.value)}
          onBlur={handleEndTimeBlur}
          className="w-24 rounded border border-input bg-background px-2 py-1 font-mono"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Text content */}
      {isEditingText ? (
        <textarea
          ref={textAreaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleTextSave}
          onKeyDown={handleTextKeyDown}
          className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
          rows={2}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p
          className="cursor-text text-sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditingText(true);
          }}
        >
          {segment.text}
        </p>
      )}

      {/* Actions */}
      <div className="mt-2 flex justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="text-destructive hover:text-destructive"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
