import { useEffect, useState, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { globalStyleAtom } from '../../atoms/captionAtoms';
import { userPresetsAtom } from '../../atoms/presetAtoms';
import { BUILT_IN_PRESETS, loadUserPresets, saveUserPresets } from '../../lib/style/builtInPresets';
import { PresetCard } from './PresetCard';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { nanoid } from 'nanoid';

export function PresetTab() {
  const globalStyle = useAtomValue(globalStyleAtom);
  const setGlobalStyle = useSetAtom(globalStyleAtom);
  const [userPresets, setUserPresets] = useAtom(userPresetsAtom);

  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load user presets on mount
  useEffect(() => {
    const loaded = loadUserPresets();
    setUserPresets(loaded);
  }, [setUserPresets]);

  // Save user presets when they change
  useEffect(() => {
    saveUserPresets(userPresets);
  }, [userPresets]);

  // Focus input when save form opens
  useEffect(() => {
    if (isSavingPreset && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isSavingPreset]);

  const handleApplyPreset = (presetStyle: typeof globalStyle) => {
    setGlobalStyle(presetStyle);
    toast.success('Preset applied');
  };

  const handleSavePreset = () => {
    const name = newPresetName.trim();
    if (!name) return;

    const newPreset = {
      id: nanoid(),
      name,
      style: globalStyle,
      isBuiltIn: false,
    };

    setUserPresets((prev) => [...prev, newPreset]);
    setIsSavingPreset(false);
    setNewPresetName('');
    toast.success(`Saved preset "${name}"`);
  };

  const handleDeletePreset = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const preset = userPresets.find((p) => p.id === deleteTarget);
    setUserPresets((prev) => prev.filter((p) => p.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success(`Deleted "${preset?.name ?? 'preset'}"`);
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 shrink-0">
        <span className="text-sm font-medium">Style Presets</span>
        {!isSavingPreset ? (
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => {
              setNewPresetName('');
              setIsSavingPreset(true);
            }}
          >
            Save Current
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              ref={nameInputRef}
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePreset();
                if (e.key === 'Escape') {
                  setIsSavingPreset(false);
                  setNewPresetName('');
                }
              }}
              placeholder="Preset name…"
              className="h-7 rounded border border-border bg-surface-2 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring w-32"
            />
            <Button
              size="icon"
              variant="primary"
              onClick={handleSavePreset}
              disabled={!newPresetName.trim()}
              className="h-7 w-7"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsSavingPreset(false);
                setNewPresetName('');
              }}
              className="h-7 text-muted-foreground"
            >
              ✕
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Built-in Presets */}
        <section>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Built-in
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {BUILT_IN_PRESETS.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                onApply={() => handleApplyPreset(preset.style)}
              />
            ))}
          </div>
        </section>

        {/* User Presets */}
        {userPresets.length > 0 && (
          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Presets
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {userPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onApply={() => handleApplyPreset(preset.style)}
                  onDelete={() => handleDeletePreset(preset.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete preset?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
