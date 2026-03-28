import { useState } from 'react'

function shortSha(sha) {
  if (!sha) return ''
  return sha.slice(0, 7)
}

export default function ResultCard({ result, onReset }) {
  const isDone = result?.status === 'done'
  const [copyState, setCopyState] = useState('idle')
  const canUseClipboard = typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.writeText)

  const copyUrl = async () => {
    if (!result?.pages_url) return
    if (!canUseClipboard) {
      setCopyState('error')
      return
    }
    try {
      await navigator.clipboard.writeText(result.pages_url)
      setCopyState('success')
    } catch {
      setCopyState('error')
    }
  }

  if (isDone) {
    return (
      <section className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 md:p-6">
        <h3 className="text-xl font-semibold text-emerald-100">Deployment Live</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-200">
          <p>
            Pages URL:{' '}
            <a href={result.pages_url} target="_blank" rel="noreferrer" className="text-indigo-300 underline">
              {result.pages_url}
            </a>
          </p>
          <p>
            Repo URL:{' '}
            <a href={result.repo_url} target="_blank" rel="noreferrer" className="text-indigo-300 underline">
              {result.repo_url}
            </a>
          </p>
          <p>
            Commit:{' '}
            <span className="rounded bg-[#0a1325] px-2 py-1 font-mono text-xs text-slate-100">{shortSha(result.commit_sha)}</span>
          </p>
        </div>

        <p className="mt-3 text-xs text-slate-400">Preview may take ~30s to load while GitHub Pages propagates.</p>
        <iframe
          title="Deployment Preview"
          src={result.pages_url}
          className="mt-3 h-80 w-full rounded-xl border border-slate-700 bg-white"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyUrl}
            className="rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canUseClipboard}
          >
            {copyState === 'success' ? 'Copied!' : 'Copy URL'}
          </button>
          {copyState === 'error' ? <p className="self-center text-xs text-rose-300">Clipboard permission denied.</p> : null}
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-3.5 py-2 text-sm font-medium text-white transition hover:from-cyan-400 hover:to-indigo-400"
          >
            Deploy Another
          </button>
        </div>
      </section>
    )
  }

  if (result?.status === 'failed') {
    return (
      <section className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-5 md:p-6">
        <h3 className="text-lg font-semibold text-rose-100">Deployment Failed</h3>
        <p className="mt-2 text-sm text-rose-100">{result.error || 'Unknown error from backend.'}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
        >
          Try Again
        </button>
      </section>
    )
  }

  return null
}
