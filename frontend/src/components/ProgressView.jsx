import LogsPanel from './LogsPanel'
import ResultCard from './ResultCard'
import StepTracker from './StepTracker'

export default function ProgressView({
  stepStates,
  result,
  networkError,
  backendUrl,
  onReset,
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_-55px_rgba(14,165,233,0.35)] backdrop-blur-xl md:p-8">
      <StepTracker stepStates={stepStates} />

      {networkError ? (
        <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 p-3 text-sm text-rose-100">
          Polling error: {networkError}
        </div>
      ) : null}

      <ResultCard result={result} onReset={onReset} />
      <LogsPanel backendUrl={backendUrl} />
    </div>
  )
}
