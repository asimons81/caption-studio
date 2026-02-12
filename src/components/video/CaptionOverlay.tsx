import { useEffect, useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useAtomValue } from 'jotai';
import { activeCaptionsAtom, globalStyleAtom } from '../../atoms/captionAtoms';
import type { CaptionSegment } from '../../types/caption';
import { styleToCSS, getScaleFactor } from '../../lib/style/styleToCSS';

interface CaptionTextProps {
  segment: CaptionSegment;
  scaleFactor: number;
}

function CaptionText({ segment, scaleFactor }: CaptionTextProps) {
  const globalStyle = useAtomValue(globalStyleAtom);
  const effectiveStyle = segment.styleOverride
    ? { ...globalStyle, ...segment.styleOverride }
    : globalStyle;

  const css = styleToCSS(effectiveStyle, scaleFactor);

  // Animation handling
  let animationStyle: CSSProperties = {};
  if (effectiveStyle.animation.type === 'fade') {
    animationStyle = {
      animation: `fadeIn ${effectiveStyle.animation.duration}ms ease-in`,
    };
  } else if (effectiveStyle.animation.type === 'slide-up') {
    animationStyle = {
      animation: `slideUp ${effectiveStyle.animation.duration}ms ease-out`,
    };
  }

  return (
    <div style={{ ...css, ...animationStyle }} key={segment.id}>
      {segment.text}
    </div>
  );
}

export function CaptionOverlay() {
  const activeCaptions = useAtomValue(activeCaptionsAtom);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const scaleFactor = getScaleFactor(dimensions.width, dimensions.height);

  return (
    <>
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 10 }}
      >
        {activeCaptions.map((caption) => (
          <CaptionText key={caption.id} segment={caption} scaleFactor={scaleFactor} />
        ))}
      </div>

      {/* Inline animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
