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
      className="neo-panel space-y-6 bg-white p-6 md:p-8"
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-sm font-black uppercase tracking-widest text-neo-ink">Task ID / Repo Name</span>
          <input
            type="text"
            required
            value={form.task}
            onChange={(event) => onFieldChange('task', event.target.value)}
            placeholder="my-awesome-app"
            className="neo-input"
          />
          <p className="mt-2 border-2 border-neo-ink bg-neo-muted px-2 py-1 text-xs font-bold">Deployment URL: {deployPreviewUrl}</p>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-black uppercase tracking-widest text-neo-ink">Prompt / Brief</span>
        <textarea
          required
          rows={6}
          value={form.brief}
          onChange={(event) => onFieldChange('brief', event.target.value)}
          placeholder="Describe the web app you want built..."
          className="w-full border-4 border-neo-ink bg-white px-4 py-3.5 text-base font-bold text-neo-ink outline-none transition duration-100 ease-linear placeholder:text-black/40 focus:bg-neo-secondary focus:shadow-neoSm"
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
          className="neo-button min-w-52 bg-neo-accent text-sm text-neo-ink hover:bg-[#ff5555]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
