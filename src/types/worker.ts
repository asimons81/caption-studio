export interface TranscriptionProgress {
  type: 'download' | 'extract' | 'transcribe';
  progress: number; // 0-100
  message: string;
}

export interface TranscriptionResult {
  segments: Array<{
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

export interface ExportProgress {
  type: 'prepare' | 'encode' | 'complete';
  progress: number; // 0-100
  message: string;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
}
