import type { CaptionSegment, CaptionStyle } from '../../types/caption';

// Convert RGB hex to ASS color format (&HAABBGGRR - note the ABGR order!)
function hexToAssColor(hex: string): string {
  // Parse #RRGGBBAA format
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = hex.length === 9 ? parseInt(hex.slice(7, 9), 16) : 255;

  // ASS uses inverted alpha (0=opaque, 255=transparent)
  const assAlpha = 255 - a;

  // Format as &HAABBGGRR
  return `&H${assAlpha.toString(16).padStart(2, '0').toUpperCase()}${b.toString(16).padStart(2, '0').toUpperCase()}${g.toString(16).padStart(2, '0').toUpperCase()}${r.toString(16).padStart(2, '0').toUpperCase()}`;
}

// Convert style to ASS format string
function styleToASS(style: CaptionStyle, _videoWidth: number, videoHeight: number): string {
  // Scale font size from 1080p reference to video dimensions
  const scaleFactor = videoHeight / 1080;
  const fontSize = Math.round(style.fontSize * scaleFactor);

  // Alignment: 1-3 bottom, 4-6 middle, 7-9 top; within each: left, center, right
  let alignment = 2; // default bottom center
  if (style.verticalPosition === 'top') {
    alignment = style.horizontalPosition === 'left' ? 7 : style.horizontalPosition === 'right' ? 9 : 8;
  } else if (style.verticalPosition === 'center') {
    alignment = style.horizontalPosition === 'left' ? 4 : style.horizontalPosition === 'right' ? 6 : 5;
  } else {
    alignment = style.horizontalPosition === 'left' ? 1 : style.horizontalPosition === 'right' ? 3 : 2;
  }

  // Convert colors
  const primaryColor = hexToAssColor(style.textColor);
  const outlineColor = hexToAssColor(style.outlineColor);
  // Note: Shadow color in ASS is handled via outline/shadow blend, not separate color
  const backColor = hexToAssColor(style.backgroundColor);

  // Build style string
  const parts = [
    `Default`,
    style.fontFamily,
    fontSize,
    primaryColor,
    `&H000000FF`, // SecondaryColour (unused)
    outlineColor,
    backColor,
    style.fontWeight >= 700 ? '-1' : '0', // Bold
    style.fontStyle === 'italic' ? '-1' : '0', // Italic
    '0', // Underline
    '0', // StrikeOut
    '100', // ScaleX
    '100', // ScaleY
    style.letterSpacing, // Spacing
    '0', // Angle
    '1', // BorderStyle (1 = outline + shadow)
    Math.round(style.outlineWidth * scaleFactor), // Outline
    Math.round(Math.max(style.shadowOffsetX, style.shadowOffsetY, style.shadowBlur) * scaleFactor), // Shadow
    alignment, // Alignment
    Math.round(style.marginBottom * scaleFactor), // MarginL (left)
    Math.round(style.marginBottom * scaleFactor), // MarginR (right)
    Math.round(style.marginBottom * scaleFactor), // MarginV (vertical)
    '0', // Encoding
  ];

  return parts.join(',');
}

// Format time for ASS (H:MM:SS.CC)
function formatAssTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const centisecs = Math.floor((seconds % 1) * 100);

  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`;
}

// Generate complete ASS file
export function generateASS(
  segments: CaptionSegment[],
  style: CaptionStyle,
  videoWidth: number,
  videoHeight: number
): string {
  const lines: string[] = [];

  // Script Info
  lines.push('[Script Info]');
  lines.push('Title: Caption Studio Export');
  lines.push('ScriptType: v4.00+');
  lines.push(`PlayResX: ${videoWidth}`);
  lines.push(`PlayResY: ${videoHeight}`);
  lines.push('WrapStyle: 0');
  lines.push('ScaledBorderAndShadow: yes');
  lines.push('YCbCr Matrix: None');
  lines.push('');

  // Styles
  lines.push('[V4+ Styles]');
  lines.push('Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding');
  lines.push(`Style: ${styleToASS(style, videoWidth, videoHeight)}`);
  lines.push('');

  // Events
  lines.push('[Events]');
  lines.push('Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text');

  // Sort segments by time
  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);

  for (const segment of sorted) {
    const effectiveStyle = segment.styleOverride
      ? { ...style, ...segment.styleOverride }
      : style;

    // Apply text transform
    let text = segment.text;
    if (effectiveStyle.textTransform === 'uppercase') {
      text = text.toUpperCase();
    } else if (effectiveStyle.textTransform === 'lowercase') {
      text = text.toLowerCase();
    }

    // Escape special characters
    text = text.replace(/\n/g, '\\N');

    // Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
    const line = [
      '0', // Layer
      formatAssTime(segment.startTime),
      formatAssTime(segment.endTime),
      'Default',
      '', // Name
      '0', // MarginL
      '0', // MarginR
      '0', // MarginV
      '', // Effect
      text,
    ].join(',');

    lines.push(`Dialogue: ${line}`);
  }

  return lines.join('\n');
}

export function downloadASS(
  segments: CaptionSegment[],
  style: CaptionStyle,
  videoWidth: number,
  videoHeight: number,
  filename: string = 'captions.ass'
) {
  const assContent = generateASS(segments, style, videoWidth, videoHeight);
  const blob = new Blob([assContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
