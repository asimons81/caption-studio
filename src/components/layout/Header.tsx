export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Caption Studio</h1>
        <span className="text-xs text-muted-foreground">v1.0</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Client-side video captioning
        </span>
      </div>
    </header>
  );
}
