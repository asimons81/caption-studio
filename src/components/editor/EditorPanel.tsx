import { useAtom } from 'jotai';
import { activeEditorTabAtom } from '../../atoms/uiAtoms';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { CaptionListTab } from './CaptionListTab';
import { StyleEditorTab } from './StyleEditorTab';
import { PresetTab } from './PresetTab';
import { ExportTab } from './ExportTab';

export function EditorPanel() {
  const [activeTab, setActiveTab] = useAtom(activeEditorTabAtom);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
      <TabsList className="m-4 mb-0">
        <TabsTrigger value="captions">Captions</TabsTrigger>
        <TabsTrigger value="style">Style</TabsTrigger>
        <TabsTrigger value="presets">Presets</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
      </TabsList>

      <TabsContent value="captions" className="flex-1 overflow-hidden">
        <CaptionListTab />
      </TabsContent>

      <TabsContent value="style" className="flex-1 overflow-hidden">
        <StyleEditorTab />
      </TabsContent>

      <TabsContent value="presets" className="flex-1 overflow-hidden">
        <PresetTab />
      </TabsContent>

      <TabsContent value="export" className="flex-1 overflow-hidden">
        <ExportTab />
      </TabsContent>
    </Tabs>
  );
}
