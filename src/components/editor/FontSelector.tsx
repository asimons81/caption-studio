import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { AVAILABLE_FONTS } from '../../constants/fonts';

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-muted-foreground">Font Family</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_FONTS.map((font) => (
            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
