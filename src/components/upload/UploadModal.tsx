import { useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Loader2 } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '../ui/Modal';
import { Button } from '../ui/Button';
import { DropZone } from './DropZone';
import { handleVideoUpload } from '../../lib/video/fileHandler';
import { videoFileAtom } from '../../atoms/videoAtoms';
import { isUploadModalOpenAtom } from '../../atoms/uiAtoms';
import { captionSegmentsAtom, selectedSegmentIdAtom } from '../../atoms/captionAtoms';

export function UploadModal() {
  const [isOpen, setIsOpen] = useAtom(isUploadModalOpenAtom);
  const setVideoFile = useSetAtom(videoFileAtom);
  const setSegments = useSetAtom(captionSegmentsAtom);
  const setSelectedSegmentId = useSetAtom(selectedSegmentIdAtom);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setWarning(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setWarning(null);

    try {
      const { videoFile, warning } = await handleVideoUpload(selectedFile);
      setVideoFile(videoFile);
      setSegments([]);
      setSelectedSegmentId(null);

      if (warning) {
        setWarning(warning);
        setTimeout(() => {
          setIsOpen(false);
          setSelectedFile(null);
          setWarning(null);
        }, 2000);
      } else {
        setIsOpen(false);
        setSelectedFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false);
      setSelectedFile(null);
      setError(null);
      setWarning(null);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={handleClose}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>Upload Video</ModalTitle>
          <ModalDescription>
            Select a video file to add captions. All processing happens in your browser.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-3">
          <DropZone
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {warning && (
            <div className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2.5 text-sm text-warning-foreground">
              {warning}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing video…
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Loading…' : 'Upload'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
