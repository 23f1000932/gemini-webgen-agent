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
    <section className="mt-4 rounded-2xl border border-white/10 bg-[#0d1629]/70">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:bg-white/[0.05]"
      >
        <span>Live Logs</span>
        <span className="text-xs text-slate-400">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open ? (
        <div className="border-t border-white/10 p-4">
          {loading && !logs ? <div className="h-24 animate-pulse rounded bg-slate-800/70" /> : null}
          {error ? <p className="mb-2 text-sm text-rose-400">{error}</p> : null}
          <pre
            ref={scrollRef}
            className="max-h-64 overflow-auto rounded-xl border border-white/10 bg-[#070d1a] p-3 font-mono text-xs leading-relaxed text-slate-300"
          >
            {logs || 'No logs yet.'}
          </pre>
        </div>
      ) : null}
    </section>
  )
}
