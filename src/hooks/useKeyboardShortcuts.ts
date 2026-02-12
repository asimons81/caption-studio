import { useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { captionSegmentsAtom, selectedSegmentIdAtom } from '../atoms/captionAtoms';
import { videoRefAtom } from '../atoms/videoAtoms';
import { removeSegment } from '../lib/caption/captionUtils';

export function useKeyboardShortcuts() {
  const videoRef = useAtomValue(videoRefAtom);
  const [selectedId, setSelectedId] = useAtom(selectedSegmentIdAtom);
  const setSegments = useSetAtom(captionSegmentsAtom);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Space - Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (videoRef) {
          if (videoRef.paused) {
            videoRef.play();
          } else {
            videoRef.pause();
          }
        }
      }

      // Arrow Left - Seek backward 5s
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef) {
          videoRef.currentTime = Math.max(0, videoRef.currentTime - 5);
        }
      }

      // Arrow Right - Seek forward 5s
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (videoRef) {
          videoRef.currentTime = Math.min(videoRef.duration, videoRef.currentTime + 5);
        }
      }

      // Arrow Up - Seek backward 1s
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (videoRef) {
          videoRef.currentTime = Math.max(0, videoRef.currentTime - 1);
        }
      }

      // Arrow Down - Seek forward 1s
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (videoRef) {
          videoRef.currentTime = Math.min(videoRef.duration, videoRef.currentTime + 1);
        }
      }

      // Delete/Backspace - Delete selected segment
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedId) {
        e.preventDefault();
        setSegments((prev) => removeSegment(prev, selectedId));
        setSelectedId(null);
      }

      // Escape - Deselect
      if (e.code === 'Escape') {
        e.preventDefault();
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoRef, selectedId, setSegments, setSelectedId]);
}
