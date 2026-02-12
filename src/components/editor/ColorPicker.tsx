import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Button } from '../ui/Button';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [localValue, setLocalValue] = useState(value);

  // Extract RGB and alpha from #RRGGBBAA format
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
      <span className="text-sm text-muted-foreground">{label}</span>
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-20 border"
            style={{ backgroundColor: displayColor }}
          >
            <span className="sr-only">Pick color</span>
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 rounded-lg border bg-popover p-4 shadow-md"
            sideOffset={5}
          >
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Color</label>
                <input
                  type="color"
                  value={`#${rgba.r.toString(16).padStart(2, '0')}${rgba.g.toString(16).padStart(2, '0')}${rgba.b.toString(16).padStart(2, '0')}`}
                  onChange={handleColorChange}
                  className="h-10 w-full cursor-pointer rounded border"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Opacity: {Math.round(rgba.a * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={rgba.a}
                  onChange={handleAlphaChange}
                  className="w-full"
                />
              </div>
              <div className="text-xs font-mono text-muted-foreground">{localValue}</div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
