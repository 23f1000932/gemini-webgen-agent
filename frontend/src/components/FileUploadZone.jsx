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
      <label className="mb-2 block text-sm font-black uppercase tracking-widest">Attachments</label>
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
        className={`border-4 border-dashed border-neo-ink p-6 text-center transition duration-100 ease-linear ${
          isDragging ? 'bg-neo-secondary' : 'bg-neo-bg'
        }`}
      >
        <p className="text-sm font-bold">Drag and drop images, CSV, or Markdown files</p>
        <p className="mt-1 text-xs font-bold">.png, .jpg, .webp, .csv, .md</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="neo-button mt-3 bg-neo-secondary text-sm"
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

      {error ? <p className="mt-2 border-4 border-neo-ink bg-neo-accent px-3 py-2 text-sm font-bold">{error}</p> : null}

      {attachments.length > 0 ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {attachments.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 border-4 border-neo-ink bg-white p-2.5 shadow-neoSm"
            >
              {file.isImage ? (
                <img src={file.url} alt={file.name} className="h-12 w-12 border-2 border-neo-ink object-cover" />
              ) : (
                  <div className="flex h-12 w-12 items-center justify-center border-2 border-neo-ink bg-neo-muted text-xs font-black">
                    FILE
                  </div>
                )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-neo-ink">{file.name}</p>
              </div>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(index)}
                  className="border-2 border-neo-ink bg-white px-2 py-1 text-xs font-bold uppercase transition hover:bg-neo-accent"
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
