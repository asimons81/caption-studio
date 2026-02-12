export interface CaptionSegment {
  id: string;
  startTime: number; // seconds (float)
  endTime: number;
  text: string;
  styleOverride?: Partial<CaptionStyle>;
}

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number; // px relative to 1080p
  fontWeight: number; // 100-900
  fontStyle: 'normal' | 'italic';
  textTransform: 'none' | 'uppercase' | 'lowercase';
  letterSpacing: number;
  textColor: string; // RGBA hex "#RRGGBBAA"
  outlineColor: string;
  outlineWidth: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  backgroundColor: string;
  backgroundPadding: number;
  backgroundBorderRadius: number;
  backgroundOpacity: number;
  verticalPosition: 'top' | 'center' | 'bottom';
  horizontalPosition: 'left' | 'center' | 'right';
  marginBottom: number;
  marginTop: number;
  animation: {
    type: 'none' | 'fade' | 'slide-up' | 'typewriter' | 'word-highlight';
    duration: number; // ms
  };
}

export interface CaptionPreset {
  id: string;
  name: string;
  style: CaptionStyle;
  isBuiltIn: boolean;
}
