import { nanoid } from 'nanoid';
import type { CaptionSegment } from '../../types/caption';

function parseTime(srtTime: string): number {
  // Parse SRT format: 00:00:20,000
  const match = srtTime.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
  if (!match) return 0;

  const [, hours, minutes, seconds, milliseconds] = match;
  return (
    parseInt(hours, 10) * 3600 +
    parseInt(minutes, 10) * 60 +
    parseInt(seconds, 10) +
    parseInt(milliseconds, 10) / 1000
  );
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function parseSRT(srtContent: string): CaptionSegment[] {
  const segments: CaptionSegment[] = [];
  const blocks = srtContent.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;

    // Skip the sequence number (first line)
    const timeLine = lines[1];
    const textLines = lines.slice(2);

    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;

    const startTime = parseTime(timeMatch[1]);
    const endTime = parseTime(timeMatch[2]);
    const text = textLines.join('\n').trim();

    if (text) {
      segments.push({
        id: nanoid(),
        startTime,
        endTime,
        text,
      });
    }
  }

  return segments;
}

export function generateSRT(segments: CaptionSegment[]): string {
  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);

  return sorted
    .map((segment, index) => {
      const sequenceNumber = index + 1;
      const startTime = formatTime(segment.startTime);
      const endTime = formatTime(segment.endTime);

      return `${sequenceNumber}\n${startTime} --> ${endTime}\n${segment.text}\n`;
    })
    .join('\n');
}

export function downloadSRT(segments: CaptionSegment[], filename: string = 'captions.srt') {
  const srtContent = generateSRT(segments);
  const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
