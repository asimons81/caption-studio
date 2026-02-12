import { isValidVideoFile, checkFileSize, loadVideoMetadata } from './videoUtils';

export async function handleVideoUpload(file: File) {
  // Validate file type
  if (!isValidVideoFile(file)) {
    throw new Error('Invalid file type. Supported formats: MP4, WebM, MOV, AVI');
  }

  // Check file size
  const sizeCheck = checkFileSize(file);
  if (!sizeCheck.valid) {
    throw new Error(sizeCheck.message);
  }

  // Load metadata
  const videoFile = await loadVideoMetadata(file);

  return {
    videoFile,
    warning: sizeCheck.warning ? sizeCheck.message : null,
  };
}
