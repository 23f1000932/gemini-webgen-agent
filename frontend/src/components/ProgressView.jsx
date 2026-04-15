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
    <div className="neo-panel space-y-4 bg-white p-6 md:p-8">
      <StepTracker stepStates={stepStates} />

      {networkError ? (
        <div className="border-4 border-neo-ink bg-neo-accent p-3 text-sm font-bold text-neo-ink">
          Polling error: {networkError}
        </div>
      ) : null}

      <ResultCard result={result} onReset={onReset} />
      <LogsPanel backendUrl={backendUrl} />
    </div>
  )
}
