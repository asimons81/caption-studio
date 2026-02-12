export interface VideoFile {
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
}
