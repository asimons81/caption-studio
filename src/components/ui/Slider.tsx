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
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && displayValue !== undefined && (
            <span className="font-medium">{formattedValue}</span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={clsx(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        value={value as number[]}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  );
});

Slider.displayName = 'Slider';
