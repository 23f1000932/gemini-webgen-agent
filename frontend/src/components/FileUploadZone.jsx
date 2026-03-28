import { useRef, useState } from 'react'

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/csv',
  'text/markdown',
  'text/x-markdown',
])

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.csv', '.md', '.markdown']

function hasAllowedExtension(filename) {
  const lower = filename.toLowerCase()
  return ALLOWED_EXTENSIONS.some((extension) => lower.endsWith(extension))
}

function isAcceptedFile(file) {
  return ALLOWED_TYPES.has(file.type) || hasAllowedExtension(file.name)
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`))
    reader.readAsDataURL(file)
  })
}

export default function FileUploadZone({ attachments, onAddAttachments, onRemoveAttachment }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const processFiles = async (fileList) => {
    const accepted = Array.from(fileList).filter(isAcceptedFile)
    const rejected = Array.from(fileList).filter((file) => !isAcceptedFile(file))
    if (rejected.length > 0) {
      setError(`Unsupported file(s): ${rejected.map((file) => file.name).join(', ')}`)
    } else {
      setError('')
    }

    if (accepted.length === 0) return

    try {
      const converted = await Promise.all(
        accepted.map(async (file) => ({
          name: file.name,
          url: await toDataUrl(file),
          isImage: file.type.startsWith('image/'),
        })),
      )
      onAddAttachments(converted)
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'Failed to add attachment.')
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-100">Attachments</label>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (event) => {
          event.preventDefault()
          setIsDragging(false)
          await processFiles(event.dataTransfer.files)
        }}
        className={`rounded-2xl border border-dashed p-6 text-center transition ${
          isDragging ? 'border-cyan-300/60 bg-cyan-400/10' : 'border-white/15 bg-[#0d1629]/70'
        }`}
      >
        <p className="text-sm text-slate-200">Drag and drop images, CSV, or Markdown files</p>
        <p className="mt-1 text-xs text-slate-400">.png, .jpg, .webp, .csv, .md</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm text-slate-100 transition hover:bg-white/[0.08]"
        >
          Choose files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.csv,.md,.markdown,image/png,image/jpeg,image/webp,text/csv,text/markdown"
          className="hidden"
          onChange={async (event) => {
            if (event.target.files) {
              await processFiles(event.target.files)
            }
            event.target.value = ''
          }}
        />
      </div>

      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}

      {attachments.length > 0 ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {attachments.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
            >
              {file.isImage ? (
                <img src={file.url} alt={file.name} className="h-12 w-12 rounded-md object-cover" />
              ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#13203b] text-xs text-slate-300">
                    FILE
                  </div>
                )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200">{file.name}</p>
              </div>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(index)}
                  className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/[0.06]"
                >
                  Remove
                </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
