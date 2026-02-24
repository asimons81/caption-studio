import type { ReactNode } from 'react';
import { useAtomValue } from 'jotai';
import { Header } from './Header';
import { isSidebarCollapsedAtom } from '../../atoms/uiAtoms';
import clsx from 'clsx';

interface MainLayoutProps {
  sidebar?: ReactNode;
  video?: ReactNode;
  timeline?: ReactNode;
}

export function MainLayout({ sidebar, video, timeline }: MainLayoutProps) {
  const isSidebarCollapsed = useAtomValue(isSidebarCollapsedAtom);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Editor Panel */}
        {sidebar && (
          <div
            className={clsx(
              'hidden md:flex shrink-0 transition-all duration-300 ease-in-out',
              isSidebarCollapsed ? 'md:w-0 overflow-hidden' : 'md:w-80 lg:w-96'
            )}
          >
            {sidebar}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Video Preview Area */}
          <div className="flex flex-1 items-center justify-center bg-black overflow-hidden">
            {video}
          </div>

          {/* Timeline Area */}
          {timeline && (
            <div className="border-t border-border bg-surface-1 shrink-0">
              {timeline}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar - Stacked below video */}
      {sidebar && (
        <div className="flex md:hidden border-t border-border bg-surface-1 max-h-[40vh] overflow-auto">
          {sidebar}
        </div>
      )}
    </div>
  );
}
