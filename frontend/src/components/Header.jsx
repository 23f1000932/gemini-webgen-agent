function statusColor(status) {
  if (status === 'online') return 'bg-[#00d084]'
  if (status === 'offline') return 'bg-neo-accent'
  return 'bg-neo-muted'
}

export default function Header({ healthStatus, healthMessage, onOpenSettings, theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-20 border-b-4 border-neo-ink bg-neo-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <h1 className="-rotate-1 border-4 border-neo-ink bg-neo-secondary px-3 py-1 text-lg font-black uppercase tracking-tight md:text-2xl">
            WebGen Agent
          </h1>
          <div
            className="inline-flex items-center gap-2 rounded-full border-4 border-neo-ink bg-white px-3 py-1 text-xs font-black uppercase tracking-wider"
            title={healthMessage}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor(healthStatus)}`} />
            <span className="hidden sm:inline">
              {healthStatus === 'unchecked' ? 'Unchecked' : healthStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="neo-button bg-white text-sm"
            aria-label="Toggle theme"
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="neo-button bg-neo-muted text-sm"
            aria-label="Open settings"
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  )
}
