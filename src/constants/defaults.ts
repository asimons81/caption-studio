import type { CaptionStyle } from '../types/caption';

export const DEFAULT_STYLE: CaptionStyle = {
  fontFamily: 'Inter',
  fontSize: 48,
  fontWeight: 700,
  fontStyle: 'normal',
  textTransform: 'none',
  letterSpacing: 0,
  textColor: '#FFFFFFFF',
  outlineColor: '#000000FF',
  outlineWidth: 2,
  shadowColor: '#00000080',
  shadowOffsetX: 0,
  shadowOffsetY: 2,
  shadowBlur: 4,
  backgroundColor: '#00000000',
  backgroundPadding: 16,
  backgroundBorderRadius: 8,
  backgroundOpacity: 1,
  verticalPosition: 'bottom',
  horizontalPosition: 'center',
  marginBottom: 60,
  marginTop: 60,
  animation: {
    type: 'fade',
    duration: 200,
  },
};

export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
export const WARN_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const SUPPORTED_VIDEO_FORMATS = ['.mp4', '.webm', '.mov', '.avi'];
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
