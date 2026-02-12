import { useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { globalStyleAtom } from '../../atoms/captionAtoms';
import { userPresetsAtom } from '../../atoms/presetAtoms';
import { BUILT_IN_PRESETS, loadUserPresets, saveUserPresets } from '../../lib/style/builtInPresets';
import { PresetCard } from './PresetCard';
import { Button } from '../ui/Button';
import { nanoid } from 'nanoid';

export function PresetTab() {
  const globalStyle = useAtomValue(globalStyleAtom);
  const setGlobalStyle = useSetAtom(globalStyleAtom);
  const [userPresets, setUserPresets] = useAtom(userPresetsAtom);

  // Load user presets on mount
  useEffect(() => {
    const loaded = loadUserPresets();
    setUserPresets(loaded);
  }, [setUserPresets]);

  // Save user presets when they change
  useEffect(() => {
    if (userPresets.length > 0) {
      saveUserPresets(userPresets);
    }
  }, [userPresets]);

  const handleApplyPreset = (presetStyle: typeof globalStyle) => {
    setGlobalStyle(presetStyle);
  };

  const handleSaveAsPreset = () => {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const newPreset = {
      id: nanoid(),
      name,
      style: globalStyle,
      isBuiltIn: false,
    };

    setUserPresets((prev) => [...prev, newPreset]);
  };

  const handleDeletePreset = (id: string) => {
    if (confirm('Delete this preset?')) {
      setUserPresets((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Style Presets</h3>
        <Button size="sm" onClick={handleSaveAsPreset}>
          Save Current Style
        </Button>
      </div>

      {/* Built-in Presets */}
      <section className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-muted-foreground">Built-in</h4>
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
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">My Presets</h4>
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
  );
}
