import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { captionSegmentsAtom, globalStyleAtom } from '../atoms/captionAtoms';
import { videoFileAtom } from '../atoms/videoAtoms';
import { AUTO_SAVE_INTERVAL } from '../constants/defaults';

export function useAutoSave() {
  const segments = useAtomValue(captionSegmentsAtom);
  const style = useAtomValue(globalStyleAtom);
  const videoFile = useAtomValue(videoFileAtom);

  useEffect(() => {
    const interval = setInterval(() => {
      if (segments.length > 0 || videoFile) {
        try {
          const projectData = {
            segments,
            style,
            videoFileName: videoFile?.file.name,
            savedAt: Date.now(),
          };

          localStorage.setItem('caption-studio-autosave', JSON.stringify(projectData));
          console.log('[AutoSave] Project saved to localStorage');
        } catch (error) {
          console.error('[AutoSave] Failed to save:', error);
        }
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [segments, style, videoFile]);
}

export function loadAutoSave() {
  try {
    const saved = localStorage.getItem('caption-studio-autosave');
    if (!saved) return null;

    const data = JSON.parse(saved);
    console.log('[AutoSave] Loaded project from', new Date(data.savedAt));
    return data;
  } catch (error) {
    console.error('[AutoSave] Failed to load:', error);
    return null;
  }
}

export function clearAutoSave() {
  try {
    localStorage.removeItem('caption-studio-autosave');
    console.log('[AutoSave] Cleared');
  } catch (error) {
    console.error('[AutoSave] Failed to clear:', error);
  }
}
