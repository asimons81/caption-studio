import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-40',
          'select-none cursor-pointer',
          /* variants */
          variant === 'primary' && [
            'bg-primary text-primary-foreground',
            'hover:opacity-90',
            'active:scale-[0.98]',
          ],
          variant === 'secondary' && [
            'bg-surface-3 text-foreground border border-border',
            'hover:bg-surface-4',
            'active:scale-[0.98]',
          ],
          variant === 'destructive' && [
            'bg-destructive text-destructive-foreground',
            'hover:opacity-85',
            'active:scale-[0.98]',
          ],
          variant === 'ghost' && [
            'text-foreground',
            'hover:bg-surface-3',
          ],
          variant === 'outline' && [
            'border border-border text-foreground bg-transparent',
            'hover:bg-surface-3',
          ],
          /* sizes */
          size === 'sm' && 'h-7 rounded-md px-2.5 text-xs',
          size === 'md' && 'h-9 rounded-md px-3.5 text-sm',
          size === 'lg' && 'h-11 rounded-lg px-5 text-base',
          size === 'icon' && 'h-8 w-8 rounded-md p-0',
          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {size !== 'icon' && children}
        {iconRight && !loading && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
