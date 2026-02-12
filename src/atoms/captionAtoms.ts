import { atom } from 'jotai';
import type { CaptionSegment, CaptionStyle } from '../types/caption';
import { DEFAULT_STYLE } from '../constants/defaults';
import { playbackStateAtom } from './videoAtoms';

export const captionSegmentsAtom = atom<CaptionSegment[]>([]);

export const selectedSegmentIdAtom = atom<string | null>(null);

export const globalStyleAtom = atom<CaptionStyle>(DEFAULT_STYLE);

// Derived atom: Get active captions at current time
export const activeCaptionsAtom = atom((get) => {
  const segments = get(captionSegmentsAtom);
  const playback = get(playbackStateAtom);

  return segments.filter(
    (segment) =>
      segment.startTime <= playback.currentTime &&
      segment.endTime >= playback.currentTime
  );
});

// Derived atom: Get selected segment
export const selectedSegmentAtom = atom((get) => {
  const segments = get(captionSegmentsAtom);
  const selectedId = get(selectedSegmentIdAtom);

  return segments.find((s) => s.id === selectedId) ?? null;
});
