import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef } from 'react';
import clsx from 'clsx';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
}

export const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, label, id, ...props }, ref) => {
  const switchId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-center gap-2">
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        className={clsx(
          'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
          'bg-surface-4 transition-colors duration-200',
          'data-[state=checked]:bg-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={clsx(
            'pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-sm',
            'ring-0 transition-transform duration-200',
            'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5',
          )}
        />
      </SwitchPrimitive.Root>
      {label && (
        <label
          htmlFor={switchId}
          className="cursor-pointer select-none text-xs text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          {label}
        </label>
      )}
    </div>
  );
});

Switch.displayName = 'Switch';
