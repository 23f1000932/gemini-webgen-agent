function InputField({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black uppercase tracking-widest">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="neo-input"
      />
    </label>
  )
}

function statusColor(status) {
  if (status === 'online') return 'bg-[#00d084]'
  if (status === 'offline') return 'bg-neo-accent'
  return 'bg-neo-muted'
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl border-4 border-neo-ink bg-neo-bg p-6 shadow-neoLg">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="inline-block -rotate-1 border-4 border-neo-ink bg-neo-secondary px-3 py-1 text-xl font-black uppercase">
              Settings
            </h2>
            <p className="mt-2 text-sm font-bold">All values stay in your browser local storage.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="neo-button bg-white px-2.5 py-1.5 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 border-4 border-neo-ink bg-white p-3 text-sm font-bold">
          <div className="inline-flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusColor(healthStatus)}`} />
            <span>{healthStatus === 'online' ? 'Backend reachable' : healthStatus === 'offline' ? 'Backend offline' : 'Health unchecked'}</span>
          </div>
          <p className="mt-1 text-xs">{healthMessage}</p>
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
            className="neo-button bg-white text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="neo-button bg-neo-accent text-sm"
            disabled={!hasUnsavedChanges}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
