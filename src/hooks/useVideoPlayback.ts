import { useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { videoRefAtom, playbackStateAtom } from '../atoms/videoAtoms';

export function useVideoPlayback() {
  const [videoRef, setVideoRef] = useAtom(videoRefAtom);
  const setPlaybackState = useSetAtom(playbackStateAtom);
  const rafIdRef = useRef<number | undefined>(undefined);

  // Start requestAnimationFrame loop
  useEffect(() => {
    if (!videoRef) return;

    const updateTime = () => {
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: videoRef.currentTime,
        isPlaying: !videoRef.paused,
      }));
      rafIdRef.current = requestAnimationFrame(updateTime);
    };

    rafIdRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [videoRef, setPlaybackState]);

  // Re-sync on visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && videoRef) {
        setPlaybackState((prev) => ({
          ...prev,
          currentTime: videoRef.currentTime,
          isPlaying: !videoRef.paused,
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [videoRef, setPlaybackState]);

  // Set up event listeners
  useEffect(() => {
    if (!videoRef) return;

    const handleLoadedMetadata = () => {
      setPlaybackState((prev) => ({
        ...prev,
        duration: videoRef.duration,
      }));
    };

    const handleVolumeChange = () => {
      setPlaybackState((prev) => ({
        ...prev,
        volume: videoRef.volume,
      }));
    };

    const handleRateChange = () => {
      setPlaybackState((prev) => ({
        ...prev,
        playbackRate: videoRef.playbackRate,
      }));
    };

    videoRef.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoRef.addEventListener('volumechange', handleVolumeChange);
    videoRef.addEventListener('ratechange', handleRateChange);

    return () => {
      videoRef.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoRef.removeEventListener('volumechange', handleVolumeChange);
      videoRef.removeEventListener('ratechange', handleRateChange);
    };
  }, [videoRef, setPlaybackState]);

  const play = () => videoRef?.play();
  const pause = () => videoRef?.pause();
  const togglePlay = () => (videoRef?.paused ? play() : pause());
  const seek = (time: number) => {
    if (videoRef) {
      videoRef.currentTime = Math.max(0, Math.min(time, videoRef.duration));
    }
  };
  const setVolume = (volume: number) => {
    if (videoRef) {
      videoRef.volume = Math.max(0, Math.min(1, volume));
    }
  };
  const setPlaybackRate = (rate: number) => {
    if (videoRef) {
      videoRef.playbackRate = rate;
    }
  };

  return {
    setVideoRef,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
  };
}
