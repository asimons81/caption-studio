import { Provider } from 'jotai';
import { MainLayout } from './components/layout';
import { Sidebar } from './components/layout/Sidebar';
import { VideoPreviewPanel } from './components/video/VideoPreviewPanel';
import { UploadModal } from './components/upload/UploadModal';
import { EditorPanel } from './components/editor/EditorPanel';
import { Timeline } from './components/timeline/Timeline';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoSave } from './hooks/useAutoSave';
import { useVideoCleanup } from './hooks/useCleanup';

function AppContent() {
  useKeyboardShortcuts();
  useAutoSave();
  useVideoCleanup();

  return (
    <>
      <MainLayout
        sidebar={
          <Sidebar>
            <EditorPanel />
          </Sidebar>
        }
        video={<VideoPreviewPanel />}
        timeline={<Timeline />}
      />
      <UploadModal />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Provider>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
