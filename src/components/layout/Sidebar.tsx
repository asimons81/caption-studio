import type { ReactNode } from 'react';
import clsx from 'clsx';

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'flex flex-col border-r bg-muted/30',
        'w-full md:w-80 lg:w-96',
        className
      )}
    >
      {children}
    </aside>
  );
}
