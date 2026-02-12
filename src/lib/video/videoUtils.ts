import type { VideoFile } from '../../types/video';
import { SUPPORTED_VIDEO_FORMATS, MAX_FILE_SIZE, WARN_FILE_SIZE } from '../../constants/defaults';

export function isValidVideoFile(file: File): boolean {
  const parts = file.name.split('.');
  if (parts.length < 2) {
    return false; // No extension
  }
  const extension = '.' + parts.pop()!.toLowerCase();
  return SUPPORTED_VIDEO_FORMATS.includes(extension);
}

export function checkFileSize(file: File): { valid: boolean; warning: boolean; message?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      warning: false,
      message: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB limit`,
    };
  }

  if (file.size > WARN_FILE_SIZE) {
    return {
      valid: true,
      warning: true,
      message: `Large file (${Math.round(file.size / (1024 * 1024))}MB) may cause performance issues`,
    };
  }

  return { valid: true, warning: false };
}

export async function loadVideoMetadata(file: File): Promise<VideoFile> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    let timeoutId: number;

    const cleanup = () => {
      clearTimeout(timeoutId);
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('error', handleError);
    };

    const handleMetadata = () => {
      cleanup();

      const videoAny = video as any;
      const hasAudio = videoAny.mozHasAudio ||
                       Boolean(videoAny.webkitAudioDecodedByteCount) ||
                       Boolean(videoAny.audioTracks?.length);

      resolve({
        file,
        url,
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        hasAudio,
      });
    };

    const handleError = () => {
      cleanup();
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata. The video file may be corrupted or in an unsupported format.'));
    };

    const handleTimeout = () => {
      cleanup();
      URL.revokeObjectURL(url);
      reject(new Error('Video metadata loading timed out. The video file may be corrupted.'));
    };

    video.preload = 'metadata';
    video.addEventListener('loadedmetadata', handleMetadata);
    video.addEventListener('error', handleError);

    // Set a 30-second timeout for loading metadata
    timeoutId = window.setTimeout(handleTimeout, 30000);

    video.src = url;
  });
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
