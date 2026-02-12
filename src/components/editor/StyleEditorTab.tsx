import { useAtom } from 'jotai';
import { globalStyleAtom } from '../../atoms/captionAtoms';
import type { CaptionStyle } from '../../types/caption';
import { Slider } from '../ui/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { FontSelector } from './FontSelector';
import { ColorPicker } from './ColorPicker';
import { PositionControls } from './PositionControls';
import { AnimationControls } from './AnimationControls';
import { FONT_WEIGHTS } from '../../constants/fonts';

export function StyleEditorTab() {
  const [style, setStyle] = useAtom(globalStyleAtom);

  const updateStyle = <K extends keyof CaptionStyle>(key: K, value: CaptionStyle[K]) => {
    setStyle((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-4">
        {/* Font Section */}
        <section>
          <h3 className="mb-3 font-semibold">Font</h3>
          <div className="space-y-3">
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

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Weight</span>
              <Select
                value={style.fontWeight.toString()}
                onValueChange={(value) => updateStyle('fontWeight', parseInt(value, 10))}
              >
                <SelectTrigger className="w-32">
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

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Style</span>
              <Select
                value={style.fontStyle}
                onValueChange={(value: 'normal' | 'italic') => updateStyle('fontStyle', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="italic">Italic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transform</span>
              <Select
                value={style.textTransform}
                onValueChange={(value: CaptionStyle['textTransform']) =>
                  updateStyle('textTransform', value)
                }
              >
                <SelectTrigger className="w-32">
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
          </div>
        </section>

        {/* Colors Section */}
        <section>
          <h3 className="mb-3 font-semibold">Colors</h3>
          <div className="space-y-3">
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
          </div>
        </section>

        {/* Outline & Shadow Section */}
        <section>
          <h3 className="mb-3 font-semibold">Outline & Shadow</h3>
          <div className="space-y-3">
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

            <Slider
              label="Shadow Offset X"
              value={[style.shadowOffsetX]}
              min={-20}
              max={20}
              step={1}
              onValueChange={(value) => updateStyle('shadowOffsetX', value[0])}
              showValue
              formatValue={(v) => `${v}px`}
            />

            <Slider
              label="Shadow Offset Y"
              value={[style.shadowOffsetY]}
              min={-20}
              max={20}
              step={1}
              onValueChange={(value) => updateStyle('shadowOffsetY', value[0])}
              showValue
              formatValue={(v) => `${v}px`}
            />

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
          </div>
        </section>

        {/* Background Section */}
        <section>
          <h3 className="mb-3 font-semibold">Background Box</h3>
          <div className="space-y-3">
            <Slider
              label="Padding"
              value={[style.backgroundPadding]}
              min={0}
              max={40}
              step={2}
              onValueChange={(value) => updateStyle('backgroundPadding', value[0])}
              showValue
              formatValue={(v) => `${v}px`}
            />

            <Slider
              label="Border Radius"
              value={[style.backgroundBorderRadius]}
              min={0}
              max={40}
              step={2}
              onValueChange={(value) => updateStyle('backgroundBorderRadius', value[0])}
              showValue
              formatValue={(v) => `${v}px`}
            />
          </div>
        </section>

        {/* Position Section */}
        <section>
          <h3 className="mb-3 font-semibold">Position</h3>
          <div className="space-y-3">
            <PositionControls
              vertical={style.verticalPosition}
              horizontal={style.horizontalPosition}
              onVerticalChange={(value) => updateStyle('verticalPosition', value)}
              onHorizontalChange={(value) => updateStyle('horizontalPosition', value)}
            />

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
        </section>

        {/* Animation Section */}
        <section>
          <h3 className="mb-3 font-semibold">Animation</h3>
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
        </section>
      </div>
    </div>
  );
}
