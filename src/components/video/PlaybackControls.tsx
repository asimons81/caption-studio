import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { playbackStateAtom } from '../../atoms/videoAtoms';
import { useVideoPlayback } from '../../hooks/useVideoPlayback';
import { formatTime } from '../../lib/video/videoUtils';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { Tooltip } from '../ui/Tooltip';
import clsx from 'clsx';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function PlaybackControls() {
  const playback = useAtomValue(playbackStateAtom);
  const { togglePlay, seek, setVolume, setPlaybackRate } = useVideoPlayback();
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  const handleSeek = (value: number[]) => seek(value[0]);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume || 1);
      setIsMuted(false);
    } else {
      setPrevVolume(playback.volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSkipBack = () => seek(Math.max(0, playback.currentTime - 10));
  const handleSkipForward = () => seek(Math.min(playback.duration, playback.currentTime + 10));

  const cycleSpeed = () => {
    const currentIdx = SPEED_OPTIONS.indexOf(playback.playbackRate);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    setPlaybackRate(SPEED_OPTIONS[nextIdx]);
  };

  const effectiveVolume = isMuted ? 0 : playback.volume;

  return (
    <div className="flex flex-col gap-2 bg-surface-1 border-t border-border px-4 pt-2 pb-3 shrink-0">
      {/* Scrubber */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground tabular-nums w-10 shrink-0">
          {formatTime(playback.currentTime)}
        </span>
        <Slider
          value={[playback.currentTime]}
          min={0}
          max={playback.duration || 100}
          step={0.05}
          onValueChange={handleSeek}
          className="flex-1"
        />
        <span className="font-mono text-xs text-muted-foreground tabular-nums w-10 shrink-0 text-right">
          {formatTime(playback.duration)}
        </span>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Volume */}
        <div className="flex items-center gap-1.5 w-28 shrink-0">
          <Tooltip content={isMuted ? 'Unmute' : 'Mute'} side="top">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMuteToggle}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              {isMuted || effectiveVolume === 0 ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </Tooltip>
          <Slider
            value={[effectiveVolume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-16"
          />
        </div>

        {/* Center: Transport controls */}
        <div className="flex items-center gap-1">
          <Tooltip content="Back 10s (J)" side="top">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipBack}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip content={playback.isPlaying ? 'Pause (Space)' : 'Play (Space)'} side="top">
            <button
              onClick={togglePlay}
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150',
                'bg-primary text-white hover:opacity-90 active:scale-95',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              {playback.isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current translate-x-0.5" />
              )}
            </button>
          </Tooltip>

          <Tooltip content="Forward 10s (L)" side="top">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipForward}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>

        {/* Right: Speed */}
        <div className="flex items-center justify-end w-28 shrink-0">
          <Tooltip content="Cycle playback speed" side="top">
            <button
              onClick={cycleSpeed}
              className={clsx(
                'rounded-md border border-border bg-surface-2 px-2 py-0.5',
                'font-mono text-xs text-muted-foreground',
                'hover:bg-surface-3 hover:text-foreground transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                playback.playbackRate !== 1 && 'border-primary/40 text-primary',
              )}
            >
              {playback.playbackRate}×
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
