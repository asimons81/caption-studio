import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { videoFileAtom } from '../atoms/videoAtoms';

export function useVideoCleanup() {
  const videoFile = useAtomValue(videoFileAtom);

  useEffect(() => {
    // Cleanup function runs when videoFile changes or component unmounts
    return () => {
      if (videoFile?.url) {
        URL.revokeObjectURL(videoFile.url);
        console.log('[Cleanup] Revoked video Object URL');
      }
    };
  }, [videoFile]);
}
