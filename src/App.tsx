import { Provider } from 'jotai';
import { Toaster } from 'sonner';
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
import { TooltipProvider } from './components/ui/Tooltip';

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
        <TooltipProvider>
          <AppContent />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-foreground)',
              },
            }}
          />
        </TooltipProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
