import { useState, useRef, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Clapperboard, Upload, Keyboard, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { isUploadModalOpenAtom, isSidebarCollapsedAtom, projectNameAtom, isShortcutsModalOpenAtom } from '../../atoms/uiAtoms';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

export function Header() {
  const setIsUploadModalOpen = useSetAtom(isUploadModalOpenAtom);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useAtom(isSidebarCollapsedAtom);
  const [projectName, setProjectName] = useAtom(projectNameAtom);
  const [isShortcutsOpen, setIsShortcutsOpen] = useAtom(isShortcutsModalOpenAtom);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(projectName);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameSave = () => {
    const trimmed = editName.trim();
    if (trimmed) {
      setProjectName(trimmed);
    } else {
      setEditName(projectName);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') {
      setEditName(projectName);
      setIsEditingName(false);
    }
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface-1 px-3 shrink-0">
        {/* Left: Logo + Sidebar Toggle */}
        <div className="flex items-center gap-1">
          <Tooltip content={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="bottom">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </Tooltip>

          <div className="flex items-center gap-2 pl-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Clapperboard className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Caption Studio</span>
          </div>

          {/* Divider */}
          <div className="mx-2 h-4 w-px bg-border" />

          {/* Editable project name */}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              className="h-7 rounded-md bg-surface-3 border border-border px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring min-w-0 w-40"
            />
          ) : (
            <button
              onClick={() => {
                setEditName(projectName);
                setIsEditingName(true);
              }}
              className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
            >
              {projectName}
              <span className="opacity-0 group-hover:opacity-60 text-xs">✎</span>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <Tooltip content="Keyboard shortcuts (?)" side="bottom">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsShortcutsOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Button
            variant="primary"
            size="sm"
            icon={<Upload className="h-3.5 w-3.5" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Video
          </Button>
        </div>
      </header>

      <KeyboardShortcutsModal
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />
    </>
  );
}
