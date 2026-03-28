function InputField({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-100">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-[#0d1629]/85 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
      />
    </label>
  )
}

function statusColor(status) {
  if (status === 'online') return 'bg-emerald-400'
  if (status === 'offline') return 'bg-rose-500'
  return 'bg-slate-500'
}

export default function SettingsModal({
  open,
  draft,
  onChange,
  onSave,
  onClose,
  hasUnsavedChanges,
  healthStatus,
  healthMessage,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#030711]/80 px-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-white/12 bg-[#091324]/92 p-6 shadow-[0_35px_95px_-45px_rgba(56,189,248,0.45)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Settings</h2>
            <p className="mt-1 text-sm text-slate-300">All values stay in your browser local storage.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-2.5 py-1.5 text-sm text-slate-300 transition hover:bg-white/[0.08]"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-white/12 bg-white/[0.03] p-3 text-sm text-slate-300">
          <div className="inline-flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor(healthStatus)}`} />
            <span>{healthStatus === 'online' ? 'Backend reachable' : healthStatus === 'offline' ? 'Backend offline' : 'Health unchecked'}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{healthMessage}</p>
        </div>

        <div className="space-y-4">
          <InputField
            label="Backend URL (Optional)"
            value={draft.backendUrl}
            onChange={(event) => onChange('backendUrl', event.target.value)}
            placeholder="Leave blank to use this app's origin"
          />
          <InputField
            label="Email"
            type="email"
            value={draft.email}
            onChange={(event) => onChange('email', event.target.value)}
            placeholder="user@example.com"
          />
          <InputField
            label="API Key (Optional)"
            value={draft.apiKey}
            onChange={(event) => onChange('apiKey', event.target.value)}
            placeholder="X-API-Key value"
          />
          <InputField
            label="GitHub Token (Optional)"
            value={draft.githubToken}
            onChange={(event) => onChange('githubToken', event.target.value)}
            placeholder="Personal access token"
          />
          <InputField
            label="GitHub Username"
            value={draft.githubUsername}
            onChange={(event) => onChange('githubUsername', event.target.value)}
            placeholder="your-github-username"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-3.5 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!hasUnsavedChanges}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
