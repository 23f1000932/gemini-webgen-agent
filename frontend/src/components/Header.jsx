function statusColor(status) {
  if (status === 'online') return 'bg-emerald-400'
  if (status === 'offline') return 'bg-rose-500'
  return 'bg-slate-500'
}

export default function Header({ healthStatus, healthMessage, onOpenSettings }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090f1d]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-slate-50 md:text-xl">WebGen Agent</h1>
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300"
            title={healthMessage}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor(healthStatus)}`} />
            <span className="hidden sm:inline">
              {healthStatus === 'unchecked' ? 'Unchecked' : healthStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm text-slate-100 transition hover:bg-white/[0.08]"
          aria-label="Open settings"
        >
          Settings
        </button>
      </div>
    </header>
  )
}
