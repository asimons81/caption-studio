import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Slider } from '../ui/Slider';

interface AnimationControlsProps {
  type: 'none' | 'fade' | 'slide-up' | 'typewriter' | 'word-highlight';
  duration: number;
  onTypeChange: (value: string) => void;
  onDurationChange: (value: number) => void;
}

export function AnimationControls({
  type,
  duration,
  onTypeChange,
  onDurationChange,
}: AnimationControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Animation</span>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="fade">Fade In</SelectItem>
            <SelectItem value="slide-up">Slide Up</SelectItem>
            <SelectItem value="typewriter">Typewriter</SelectItem>
            <SelectItem value="word-highlight">Word Highlight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type !== 'none' && (
        <Slider
          label="Duration"
          value={[duration]}
          min={50}
          max={1000}
          step={50}
          onValueChange={(value) => onDurationChange(value[0])}
          showValue
          formatValue={(v) => `${v}ms`}
        />
      )}
    </div>
  );
}
