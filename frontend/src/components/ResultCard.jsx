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
      <section className="mt-4 border-4 border-neo-ink bg-[#9df3c4] p-5 shadow-neoMd md:p-6">
        <h3 className="inline-block -rotate-1 border-4 border-neo-ink bg-neo-secondary px-3 py-1 text-xl font-black uppercase">
          Deployment Live
        </h3>
        <div className="mt-3 space-y-2 text-sm font-bold text-neo-ink">
          <p>
            Pages URL:{' '}
            <a href={result.pages_url} target="_blank" rel="noreferrer" className="underline decoration-2">
              {result.pages_url}
            </a>
          </p>
          <p>
            Repo URL:{' '}
            <a href={result.repo_url} target="_blank" rel="noreferrer" className="underline decoration-2">
              {result.repo_url}
            </a>
          </p>
          <p>
            Commit:{' '}
            <span className="border-2 border-neo-ink bg-white px-2 py-1 font-mono text-xs">{shortSha(result.commit_sha)}</span>
          </p>
        </div>

        <p className="mt-3 text-xs font-bold">Preview may take ~30s to load while GitHub Pages propagates.</p>
        <iframe
          title="Deployment Preview"
          src={result.pages_url}
          className="mt-3 h-80 w-full border-4 border-neo-ink bg-white"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyUrl}
            className="neo-button bg-white text-sm"
            disabled={!canUseClipboard}
          >
            {copyState === 'success' ? 'Copied!' : 'Copy URL'}
          </button>
          {copyState === 'error' ? <p className="self-center text-xs font-bold">Clipboard permission denied.</p> : null}
          <button
            type="button"
            onClick={onReset}
            className="neo-button bg-neo-accent text-sm"
          >
            Deploy Another
          </button>
        </div>
      </section>
    )
  }

  if (result?.status === 'failed') {
    return (
      <section className="mt-4 border-4 border-neo-ink bg-neo-accent p-5 shadow-neoMd md:p-6">
        <h3 className="text-lg font-black uppercase">Deployment Failed</h3>
        <p className="mt-2 text-sm font-bold">{result.error || 'Unknown error from backend.'}</p>
        <button
          type="button"
          onClick={onReset}
          className="neo-button mt-4 bg-neo-secondary text-sm"
        >
          Try Again
        </button>
      </section>
    )
  }

  return null
}
