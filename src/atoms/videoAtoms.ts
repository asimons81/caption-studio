import { atom } from 'jotai';
import type { VideoFile, PlaybackState } from '../types/video';

export const videoFileAtom = atom<VideoFile | null>(null);

export const playbackStateAtom = atom<PlaybackState>({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  volume: 1,
});

export const videoRefAtom = atom<HTMLVideoElement | null>(null);
