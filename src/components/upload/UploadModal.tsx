import { useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
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

export function UploadModal() {
  const [isOpen, setIsOpen] = useAtom(isUploadModalOpenAtom);
  const setVideoFile = useSetAtom(videoFileAtom);
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

      if (warning) {
        setWarning(warning);
      }

      // Close modal after successful upload
      setTimeout(() => {
        setIsOpen(false);
        setSelectedFile(null);
        setWarning(null);
      }, warning ? 2000 : 0);
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
      <ModalContent className="max-w-xl">
        <ModalHeader>
          <ModalTitle>Upload Video</ModalTitle>
          <ModalDescription>
            Select a video file to add captions. Processing happens entirely in your browser.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4">
          <DropZone onFileSelect={handleFileSelect} />

          {selectedFile && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {warning && (
            <div className="rounded-lg bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-500">
              {warning}
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isLoading}>
            {isLoading ? 'Loading...' : 'Upload'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
