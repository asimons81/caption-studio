import { useAtomValue, useSetAtom } from 'jotai';
import { videoFileAtom } from '../../atoms/videoAtoms';
import { isUploadModalOpenAtom } from '../../atoms/uiAtoms';
import { VideoPlayer } from './VideoPlayer';
import { PlaybackControls } from './PlaybackControls';
import { Button } from '../ui/Button';

export function VideoPreviewPanel() {
  const videoFile = useAtomValue(videoFileAtom);
  const setIsUploadModalOpen = useSetAtom(isUploadModalOpenAtom);

  if (!videoFile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-white">
        <svg className="h-24 w-24 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h2 className="text-2xl font-semibold">Caption Studio</h2>
        <p className="text-muted-foreground">Upload a video to get started</p>
        <Button onClick={() => setIsUploadModalOpen(true)}>Upload Video</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex flex-1 items-center justify-center">
        <VideoPlayer />
      </div>
      <PlaybackControls />
    </div>
  );
}
