import { nanoid } from 'nanoid';
import type { CaptionSegment } from '../../types/caption';

export function createSegment(
  text: string,
  startTime: number,
  endTime: number
): CaptionSegment {
  return {
    id: nanoid(),
    text,
    startTime,
    endTime,
  };
}

export function addSegment(
  segments: CaptionSegment[],
  text: string,
  startTime: number,
  endTime: number
): CaptionSegment[] {
  const newSegment = createSegment(text, startTime, endTime);
  return [...segments, newSegment].sort((a, b) => a.startTime - b.startTime);
}

export function updateSegment(
  segments: CaptionSegment[],
  id: string,
  updates: Partial<CaptionSegment>
): CaptionSegment[] {
  return segments.map((segment) =>
    segment.id === id ? { ...segment, ...updates } : segment
  );
}

export function removeSegment(segments: CaptionSegment[], id: string): CaptionSegment[] {
  return segments.filter((segment) => segment.id !== id);
}

export function splitSegment(
  segments: CaptionSegment[],
  id: string,
  splitTime: number
): CaptionSegment[] {
  const segment = segments.find((s) => s.id === id);
  if (!segment || splitTime <= segment.startTime || splitTime >= segment.endTime) {
    return segments;
  }

  const midpoint = Math.floor(segment.text.length / 2);
  const firstText = segment.text.slice(0, midpoint).trim();
  const secondText = segment.text.slice(midpoint).trim();

  const firstSegment: CaptionSegment = {
    ...segment,
    text: firstText,
    endTime: splitTime,
  };

  const secondSegment: CaptionSegment = {
    ...segment,
    id: nanoid(),
    text: secondText,
    startTime: splitTime,
  };

  return segments.map((s) => (s.id === id ? firstSegment : s)).concat(secondSegment);
}

export function mergeSegments(
  segments: CaptionSegment[],
  id1: string,
  id2: string
): CaptionSegment[] {
  const segment1 = segments.find((s) => s.id === id1);
  const segment2 = segments.find((s) => s.id === id2);

  if (!segment1 || !segment2) {
    return segments;
  }

  const merged: CaptionSegment = {
    id: segment1.id,
    text: `${segment1.text} ${segment2.text}`,
    startTime: Math.min(segment1.startTime, segment2.startTime),
    endTime: Math.max(segment1.endTime, segment2.endTime),
    styleOverride: segment1.styleOverride || segment2.styleOverride,
  };

  return segments
    .filter((s) => s.id !== id1 && s.id !== id2)
    .concat(merged)
    .sort((a, b) => a.startTime - b.startTime);
}

export function validateSegment(segment: CaptionSegment): string[] {
  const errors: string[] = [];

  if (!segment.text.trim()) {
    errors.push('Caption text cannot be empty');
  }

  if (segment.startTime < 0) {
    errors.push('Start time cannot be negative');
  }

  if (segment.endTime <= segment.startTime) {
    errors.push('End time must be after start time');
  }

  return errors;
}

export function validateSegments(segments: CaptionSegment[]): string[] {
  const errors: string[] = [];

  segments.forEach((segment, index) => {
    const segmentErrors = validateSegment(segment);
    if (segmentErrors.length > 0) {
      errors.push(`Segment ${index + 1}: ${segmentErrors.join(', ')}`);
    }
  });

  // Check for overlaps
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].endTime > segments[i + 1].startTime) {
      errors.push(
        `Segments ${i + 1} and ${i + 2} overlap (${segments[i].endTime.toFixed(2)}s > ${segments[i + 1].startTime.toFixed(2)}s)`
      );
    }
  }

  return errors;
}
