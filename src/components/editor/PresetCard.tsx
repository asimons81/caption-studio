import type { CaptionPreset } from '../../types/caption';
import { Button } from '../ui/Button';
import { Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface PresetCardProps {
  preset: CaptionPreset;
  onApply: () => void;
  onDelete?: () => void;
}

export function PresetCard({ preset, onApply, onDelete }: PresetCardProps) {
  return (
    <div className={clsx(
      'group rounded-lg border border-border bg-surface-2 overflow-hidden',
      'hover:border-primary/40 transition-colors',
    )}>
      {/* Preview area */}
      <div
        className="flex h-14 items-center justify-center bg-black text-center px-2"
        style={{
          fontFamily: preset.style.fontFamily,
          fontSize: '13px',
          fontWeight: preset.style.fontWeight,
          color: preset.style.textColor,
          textTransform: preset.style.textTransform,
          fontStyle: preset.style.fontStyle,
        }}
      >
        Sample Caption
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-xs font-medium text-foreground">{preset.name}</span>
          {preset.isBuiltIn && (
            <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              built-in
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!preset.isBuiltIn && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          <Button size="sm" onClick={onApply} className="h-6 text-xs px-2">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
