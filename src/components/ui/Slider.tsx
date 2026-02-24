import * as SliderPrimitive from '@radix-ui/react-slider';
import { forwardRef } from 'react';
import clsx from 'clsx';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, label, showValue, formatValue, value, ...props }, ref) => {
  const displayValue = Array.isArray(value) ? value[0] : value;
  const formattedValue = formatValue && displayValue !== undefined
    ? formatValue(displayValue)
    : displayValue;

  return (
    <div className="w-full space-y-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && displayValue !== undefined && (
            <span className="font-mono font-medium text-foreground tabular-nums">
              {formattedValue}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={clsx(
          'relative flex w-full touch-none select-none items-center py-1',
          className
        )}
        value={value as number[]}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-surface-3">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className={clsx(
          'block h-4 w-4 rounded-full border-2 border-primary bg-white',
          'shadow-sm',
          'ring-offset-background transition-transform',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'hover:scale-110',
          'disabled:pointer-events-none disabled:opacity-50',
        )} />
      </SliderPrimitive.Root>
    </div>
  );
});

Slider.displayName = 'Slider';
