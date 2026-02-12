import type { ReactNode } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  sidebar?: ReactNode;
  video?: ReactNode;
  timeline?: ReactNode;
}

export function MainLayout({ sidebar, video, timeline }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Editor Panel */}
        {sidebar && (
          <div className="hidden md:flex md:w-80 lg:w-96">
            {sidebar}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Video Preview Area */}
          <div className="flex flex-1 items-center justify-center bg-black p-4">
            {video}
          </div>

          {/* Timeline Area */}
          {timeline && (
            <div className="border-t bg-background">
              {timeline}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar - Stacked */}
      {sidebar && (
        <div className="flex md:hidden border-t bg-background max-h-[40vh] overflow-auto">
          {sidebar}
        </div>
      )}
    </div>
  );
}
