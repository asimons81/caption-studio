import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [localValue, setLocalValue] = useState(value);

  const hexToRgba = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1;
    return { r, g, b, a };
  };

  const rgbaToHex = (r: number, g: number, b: number, a: number) => {
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    const aHex = Math.round(a * 255).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}${aHex}`.toUpperCase();
  };

  const rgba = hexToRgba(localValue);
  const displayColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const newHex = rgbaToHex(
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
      rgba.a
    );
    setLocalValue(newHex);
    onChange(newHex);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const alpha = parseFloat(e.target.value);
    const newHex = rgbaToHex(rgba.r, rgba.g, rgba.b, alpha);
    setLocalValue(newHex);
    onChange(newHex);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className={clsx(
              'flex h-7 w-16 items-center gap-1.5 rounded-md border border-border px-1.5',
              'hover:border-border/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            )}
          >
            <span
              className="h-4 w-4 shrink-0 rounded-sm border border-border/50"
              style={{ backgroundColor: displayColor }}
            />
            <span className="font-mono text-[10px] text-muted-foreground truncate">
              {localValue.slice(0, 7)}
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-56 rounded-lg border border-border bg-popover p-3 shadow-lg shadow-black/30"
            sideOffset={5}
            align="end"
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Color</label>
                <input
                  type="color"
                  value={`#${rgba.r.toString(16).padStart(2, '0')}${rgba.g.toString(16).padStart(2, '0')}${rgba.b.toString(16).padStart(2, '0')}`}
                  onChange={handleColorChange}
                  className="h-9 w-full cursor-pointer rounded-md border border-border bg-surface-2"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Opacity</span>
                  <span className="font-mono">{Math.round(rgba.a * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={rgba.a}
                  onChange={handleAlphaChange}
                  className="w-full accent-primary"
                />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground bg-surface-3 rounded px-2 py-1">
                {localValue}
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
