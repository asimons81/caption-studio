export function parseTimeString(timeStr: string): number | null {
  // Parse formats like "1:23.456" or "1:23" or "23.456" or "23"
  const parts = timeStr.split(':');
  let totalSeconds = 0;

  if (parts.length === 1) {
    // Just seconds
    totalSeconds = parseFloat(parts[0]);
  } else if (parts.length === 2) {
    // Minutes:seconds
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    totalSeconds = minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // Hours:minutes:seconds
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  } else {
    return null;
  }

  return isNaN(totalSeconds) ? null : totalSeconds;
}

export function formatTimeInput(seconds: number): string {
  if (!isFinite(seconds)) return '0:00.000';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
  }

  return `${minutes}:${secs.toFixed(3).padStart(6, '0')}`;
}
