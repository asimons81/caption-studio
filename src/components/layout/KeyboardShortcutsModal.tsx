import { Modal, ModalContent, ModalHeader, ModalTitle } from '../ui/Modal';

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i} className="flex items-center gap-1">
            <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-surface-3 px-1.5 font-mono text-xs text-foreground">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="text-xs text-muted-foreground">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Keyboard Shortcuts</ModalTitle>
        </ModalHeader>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Playback
            </h3>
            <div className="divide-y divide-border rounded-md border border-border px-3">
              <ShortcutRow keys={['Space']} description="Play / Pause" />
              <ShortcutRow keys={['←']} description="Seek back 5 seconds" />
              <ShortcutRow keys={['→']} description="Seek forward 5 seconds" />
              <ShortcutRow keys={['J']} description="Seek back 10 seconds" />
              <ShortcutRow keys={['L']} description="Seek forward 10 seconds" />
              <ShortcutRow keys={['K']} description="Pause" />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Captions
            </h3>
            <div className="divide-y divide-border rounded-md border border-border px-3">
              <ShortcutRow keys={['Ctrl', 'Enter']} description="Add caption at current time" />
              <ShortcutRow keys={['Delete']} description="Delete selected caption" />
              <ShortcutRow keys={['Esc']} description="Deselect caption" />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              General
            </h3>
            <div className="divide-y divide-border rounded-md border border-border px-3">
              <ShortcutRow keys={['?']} description="Show shortcuts" />
              <ShortcutRow keys={['Ctrl', 'Z']} description="Undo" />
              <ShortcutRow keys={['Ctrl', 'Shift', 'Z']} description="Redo" />
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
