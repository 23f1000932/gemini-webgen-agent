import FileUploadZone from './FileUploadZone'

export default function TaskForm({
  form,
  onFieldChange,
  onAddAttachments,
  onRemoveAttachment,
  onSubmit,
  submitDisabled,
  submitLabel,
  deployPreviewUrl,
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_-55px_rgba(14,165,233,0.35)] backdrop-blur-xl md:p-8"
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-100">Task ID / Repo Name</span>
          <input
            type="text"
            required
            value={form.task}
            onChange={(event) => onFieldChange('task', event.target.value)}
            placeholder="my-awesome-app"
            className="w-full rounded-2xl border border-white/10 bg-[#0d1629]/85 px-4 py-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <p className="mt-2 text-xs text-slate-400/95">Deployment URL: {deployPreviewUrl}</p>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-100">Brief</span>
        <textarea
          required
          rows={6}
          value={form.brief}
          onChange={(event) => onFieldChange('brief', event.target.value)}
          placeholder="Describe the web app you want built..."
          className="w-full rounded-2xl border border-white/10 bg-[#0d1629]/85 px-4 py-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
        />
      </label>

      <FileUploadZone
        attachments={form.attachments}
        onAddAttachments={onAddAttachments}
        onRemoveAttachment={onRemoveAttachment}
      />

      <div className="pt-1">
        <button
          type="submit"
          disabled={submitDisabled}
          className="inline-flex min-w-52 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_35px_-14px_rgba(6,182,212,0.85)] transition hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
