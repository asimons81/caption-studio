import { useAtom } from 'jotai';
import { MessageSquare, Paintbrush, Sparkles, Upload } from 'lucide-react';
import { activeEditorTabAtom } from '../../atoms/uiAtoms';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { CaptionListTab } from './CaptionListTab';
import { StyleEditorTab } from './StyleEditorTab';
import { PresetTab } from './PresetTab';
import { ExportTab } from './ExportTab';

const TABS = [
  { value: 'captions', label: 'Captions', icon: MessageSquare },
  { value: 'style', label: 'Style', icon: Paintbrush },
  { value: 'presets', label: 'Presets', icon: Sparkles },
  { value: 'export', label: 'Export', icon: Upload },
];

export function EditorPanel() {
  const [activeTab, setActiveTab] = useAtom(activeEditorTabAtom);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
      <TabsList className="px-2 pt-1 gap-0.5 bg-surface-1 shrink-0">
        {TABS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="flex-1">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="captions" className="flex-1 overflow-hidden mt-0">
        <CaptionListTab />
      </TabsContent>

      <TabsContent value="style" className="flex-1 overflow-hidden mt-0">
        <StyleEditorTab />
      </TabsContent>

      <TabsContent value="presets" className="flex-1 overflow-hidden mt-0">
        <PresetTab />
      </TabsContent>

      <TabsContent value="export" className="flex-1 overflow-hidden mt-0">
        <ExportTab />
      </TabsContent>
    </Tabs>
  );
}
