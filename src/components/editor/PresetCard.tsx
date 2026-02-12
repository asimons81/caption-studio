import type { CaptionPreset } from '../../types/caption';
import { Button } from '../ui/Button';

interface PresetCardProps {
  preset: CaptionPreset;
  onApply: () => void;
  onDelete?: () => void;
}

export function PresetCard({ preset, onApply, onDelete }: PresetCardProps) {
  return (
    <div className="rounded-lg border p-4 transition-colors hover:border-accent">
      <div className="mb-3 flex items-start justify-between">
        <h4 className="font-semibold">{preset.name}</h4>
        {preset.isBuiltIn && (
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
            Built-in
          </span>
        )}
      </div>

      {/* Preview */}
      <div
        className="mb-3 flex h-16 items-center justify-center rounded bg-black text-center"
        style={{
          fontFamily: preset.style.fontFamily,
          fontSize: '14px',
          fontWeight: preset.style.fontWeight,
          color: preset.style.textColor,
          textTransform: preset.style.textTransform,
        }}
      >
        Sample Text
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" onClick={onApply} className="flex-1">
          Apply
        </Button>
        {!preset.isBuiltIn && onDelete && (
          <Button size="sm" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
