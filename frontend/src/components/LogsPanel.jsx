import { useEffect, useRef, useState } from 'react'

export default function LogsPanel({ backendUrl }) {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!open || !backendUrl) {
      return undefined
    }

    let cancelled = false

    const fetchLogs = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${backendUrl}/logs?lines=50`)
        if (!response.ok) {
          throw new Error(`Failed to fetch logs (${response.status})`)
        }
        const text = await response.text()
        if (!cancelled) {
          setLogs(text)
          setError('')
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch logs.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchLogs()
    const intervalId = setInterval(fetchLogs, 5000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [open, backendUrl])

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, open])

  return (
    <section className="mt-4 border-4 border-neo-ink bg-white shadow-neoSm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between bg-neo-muted px-4 py-3 text-left text-sm font-black uppercase tracking-wider text-neo-ink transition duration-100 hover:bg-[#b59ffb]"
      >
        <span>Live Logs</span>
        <span className="text-xs">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open ? (
        <div className="border-t-4 border-neo-ink p-4">
          {loading && !logs ? <div className="h-24 animate-pulse border-4 border-neo-ink bg-neo-secondary" /> : null}
          {error ? <p className="mb-2 border-4 border-neo-ink bg-neo-accent px-3 py-2 text-sm font-bold">{error}</p> : null}
          <pre
            ref={scrollRef}
            className="max-h-64 overflow-auto border-4 border-neo-ink bg-black p-3 font-mono text-xs leading-relaxed text-white"
          >
            {logs || 'No logs yet.'}
          </pre>
        </div>
      ) : null}
    </section>
  )
}
