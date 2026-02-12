import clsx from 'clsx';

interface PositionControlsProps {
  vertical: 'top' | 'center' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
  onVerticalChange: (value: 'top' | 'center' | 'bottom') => void;
  onHorizontalChange: (value: 'left' | 'center' | 'right') => void;
}

export function PositionControls({
  vertical,
  horizontal,
  onVerticalChange,
  onHorizontalChange,
}: PositionControlsProps) {
  const positions: Array<{
    v: 'top' | 'center' | 'bottom';
    h: 'left' | 'center' | 'right';
  }> = [
    { v: 'top', h: 'left' },
    { v: 'top', h: 'center' },
    { v: 'top', h: 'right' },
    { v: 'center', h: 'left' },
    { v: 'center', h: 'center' },
    { v: 'center', h: 'right' },
    { v: 'bottom', h: 'left' },
    { v: 'bottom', h: 'center' },
    { v: 'bottom', h: 'right' },
  ];

  const handleClick = (v: typeof vertical, h: typeof horizontal) => {
    onVerticalChange(v);
    onHorizontalChange(h);
  };

  return (
    <div>
      <span className="mb-2 block text-sm text-muted-foreground">Position</span>
      <div className="grid grid-cols-3 gap-1 rounded-lg border p-2">
        {positions.map(({ v, h }) => (
          <button
            key={`${v}-${h}`}
            onClick={() => handleClick(v, h)}
            className={clsx(
              'h-8 rounded border transition-colors',
              vertical === v && horizontal === h
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-accent'
            )}
          />
        ))}
      </div>
    </div>
  );
}
