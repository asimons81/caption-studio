import type { CaptionStyle } from '../../types/caption';
import type { CSSProperties } from 'react';

export function styleToCSS(style: CaptionStyle, scaleFactor: number = 1): CSSProperties {
  const fontSize = style.fontSize * scaleFactor;

  const css: CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${fontSize}px`,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textTransform: style.textTransform,
    letterSpacing: `${style.letterSpacing}px`,
    color: style.textColor,
    position: 'absolute',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxWidth: '90%',
    pointerEvents: 'none',
  };

  // Positioning
  if (style.verticalPosition === 'top') {
    css.top = `${style.marginTop * scaleFactor}px`;
  } else if (style.verticalPosition === 'bottom') {
    css.bottom = `${style.marginBottom * scaleFactor}px`;
  } else {
    css.top = '50%';
    css.transform = 'translateY(-50%)';
  }

  if (style.horizontalPosition === 'left') {
    css.left = '5%';
    css.textAlign = 'left';
  } else if (style.horizontalPosition === 'right') {
    css.right = '5%';
    css.textAlign = 'right';
  } else {
    css.left = '50%';
    if (style.verticalPosition === 'center') {
      css.transform = 'translate(-50%, -50%)';
    } else {
      css.transform = 'translateX(-50%)';
    }
  }

  // Text stroke/outline
  if (style.outlineWidth > 0) {
    css.textShadow = `
      ${style.outlineWidth * scaleFactor}px ${style.outlineWidth * scaleFactor}px 0 ${style.outlineColor},
      -${style.outlineWidth * scaleFactor}px ${style.outlineWidth * scaleFactor}px 0 ${style.outlineColor},
      ${style.outlineWidth * scaleFactor}px -${style.outlineWidth * scaleFactor}px 0 ${style.outlineColor},
      -${style.outlineWidth * scaleFactor}px -${style.outlineWidth * scaleFactor}px 0 ${style.outlineColor}
    `;
  }

  // Drop shadow (in addition to outline)
  if (style.shadowBlur > 0 || style.shadowOffsetX !== 0 || style.shadowOffsetY !== 0) {
    const shadowStr = `${style.shadowOffsetX * scaleFactor}px ${style.shadowOffsetY * scaleFactor}px ${style.shadowBlur * scaleFactor}px ${style.shadowColor}`;
    if (css.textShadow) {
      css.textShadow += `, ${shadowStr}`;
    } else {
      css.textShadow = shadowStr;
    }
  }

  // Background
  if (style.backgroundColor && style.backgroundColor !== '#00000000') {
    const bg = style.backgroundColor;
    const padding = style.backgroundPadding * scaleFactor;
    const radius = style.backgroundBorderRadius * scaleFactor;

    css.backgroundColor = bg;
    css.padding = `${padding}px`;
    css.borderRadius = `${radius}px`;
    css.display = 'inline-block';
  }

  return css;
}

export function getScaleFactor(
  _displayWidth: number,
  displayHeight: number,
  referenceHeight: number = 1080
): number {
  // Scale based on display height relative to 1080p
  return displayHeight / referenceHeight;
}
