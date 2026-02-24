import { useState } from 'react';
import { useAtom } from 'jotai';
import { ChevronDown, Type, Palette, Layers, Pin, Zap } from 'lucide-react';
import { globalStyleAtom } from '../../atoms/captionAtoms';
import type { CaptionStyle } from '../../types/caption';
import { Slider } from '../ui/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { FontSelector } from './FontSelector';
import { ColorPicker } from './ColorPicker';
import { PositionControls } from './PositionControls';
import { AnimationControls } from './AnimationControls';
import { FONT_WEIGHTS } from '../../constants/fonts';
import clsx from 'clsx';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-surface-2 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">{icon}</span>
          {title}
        </div>
        <ChevronDown
          className={clsx(
            'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="space-y-3 px-4 pb-4 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

export function StyleEditorTab() {
  const [style, setStyle] = useAtom(globalStyleAtom);

  const updateStyle = <K extends keyof CaptionStyle>(key: K, value: CaptionStyle[K]) => {
    setStyle((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full overflow-y-auto bg-surface-1">
      {/* Font */}
      <Section title="Font" icon={<Type className="h-3.5 w-3.5" />}>
        <FontSelector
          value={style.fontFamily}
          onChange={(value) => updateStyle('fontFamily', value)}
        />

        <Slider
          label="Size"
          value={[style.fontSize]}
          min={20}
          max={120}
          step={1}
          onValueChange={(value) => updateStyle('fontSize', value[0])}
          showValue
          formatValue={(v) => `${v}px`}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Weight</label>
            <Select
              value={style.fontWeight.toString()}
              onValueChange={(value) => updateStyle('fontWeight', parseInt(value, 10))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_WEIGHTS.map((weight) => (
                  <SelectItem key={weight.value} value={weight.value.toString()}>
                    {weight.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Style</label>
            <Select
              value={style.fontStyle}
              onValueChange={(value: 'normal' | 'italic') => updateStyle('fontStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="italic">Italic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">Transform</label>
          <Select
            value={style.textTransform}
            onValueChange={(value: CaptionStyle['textTransform']) =>
              updateStyle('textTransform', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="uppercase">UPPERCASE</SelectItem>
              <SelectItem value="lowercase">lowercase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Slider
          label="Letter Spacing"
          value={[style.letterSpacing]}
          min={-5}
          max={20}
          step={0.5}
          onValueChange={(value) => updateStyle('letterSpacing', value[0])}
          showValue
          formatValue={(v) => `${v}px`}
        />
      </Section>

      {/* Colors */}
      <Section title="Colors" icon={<Palette className="h-3.5 w-3.5" />}>
        <ColorPicker
          label="Text"
          value={style.textColor}
          onChange={(value) => updateStyle('textColor', value)}
        />
        <ColorPicker
          label="Outline"
          value={style.outlineColor}
          onChange={(value) => updateStyle('outlineColor', value)}
        />
        <ColorPicker
          label="Shadow"
          value={style.shadowColor}
          onChange={(value) => updateStyle('shadowColor', value)}
        />
        <ColorPicker
          label="Background"
          value={style.backgroundColor}
          onChange={(value) => updateStyle('backgroundColor', value)}
        />
      </Section>

      {/* Outline & Shadow */}
      <Section title="Outline & Shadow" icon={<Layers className="h-3.5 w-3.5" />} defaultOpen={false}>
        <Slider
          label="Outline Width"
          value={[style.outlineWidth]}
          min={0}
          max={10}
          step={0.5}
          onValueChange={(value) => updateStyle('outlineWidth', value[0])}
          showValue
          formatValue={(v) => `${v}px`}
        />

        <div className="grid grid-cols-2 gap-3">
          <Slider
            label="Shadow X"
            value={[style.shadowOffsetX]}
            min={-20}
            max={20}
            step={1}
            onValueChange={(value) => updateStyle('shadowOffsetX', value[0])}
            showValue
            formatValue={(v) => `${v}px`}
          />
          <Slider
            label="Shadow Y"
            value={[style.shadowOffsetY]}
            min={-20}
            max={20}
            step={1}
            onValueChange={(value) => updateStyle('shadowOffsetY', value[0])}
            showValue
            formatValue={(v) => `${v}px`}
          />
        </div>

        <Slider
          label="Shadow Blur"
          value={[style.shadowBlur]}
          min={0}
          max={20}
          step={1}
          onValueChange={(value) => updateStyle('shadowBlur', value[0])}
          showValue
          formatValue={(v) => `${v}px`}
        />

        <Slider
          label="Background Padding"
          value={[style.backgroundPadding]}
          min={0}
          max={40}
          step={2}
          onValueChange={(value) => updateStyle('backgroundPadding', value[0])}
          showValue
          formatValue={(v) => `${v}px`}
        />

        <Slider
          label="Background Radius"
          value={[style.backgroundBorderRadius]}
          min={0}
          max={40}
          step={2}
          onValueChange={(value) => updateStyle('backgroundBorderRadius', value[0])}
          showValue
          formatValue={(v) => `${v}px`}
        />
      </Section>

      {/* Position */}
      <Section title="Position" icon={<Pin className="h-3.5 w-3.5" />} defaultOpen={false}>
        <PositionControls
          vertical={style.verticalPosition}
          horizontal={style.horizontalPosition}
          onVerticalChange={(value) => updateStyle('verticalPosition', value)}
          onHorizontalChange={(value) => updateStyle('horizontalPosition', value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Slider
            label="Margin Top"
            value={[style.marginTop]}
            min={0}
            max={200}
            step={5}
            onValueChange={(value) => updateStyle('marginTop', value[0])}
            showValue
            formatValue={(v) => `${v}px`}
          />
          <Slider
            label="Margin Bottom"
            value={[style.marginBottom]}
            min={0}
            max={200}
            step={5}
            onValueChange={(value) => updateStyle('marginBottom', value[0])}
            showValue
            formatValue={(v) => `${v}px`}
          />
        </div>
      </Section>

      {/* Animation */}
      <Section title="Animation" icon={<Zap className="h-3.5 w-3.5" />} defaultOpen={false}>
        <AnimationControls
          type={style.animation.type}
          duration={style.animation.duration}
          onTypeChange={(value) =>
            updateStyle('animation', {
              ...style.animation,
              type: value as CaptionStyle['animation']['type'],
            })
          }
          onDurationChange={(value) =>
            updateStyle('animation', { ...style.animation, duration: value })
          }
        />
      </Section>
    </div>
  );
}
