const STEPS = [
  'Request Sent',
  'Generating Files (Gemini AI)',
  'Committing to GitHub',
  'Enabling GitHub Pages',
  'Deployment Live',
]

function stepStyle(state) {
  if (state === 'done') return 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
  if (state === 'active') return 'border-cyan-300/45 bg-cyan-400/10 text-cyan-200'
  if (state === 'error') return 'border-rose-400/45 bg-rose-500/10 text-rose-200'
  return 'border-white/10 bg-[#0d1629]/70 text-slate-400'
}

export default function StepTracker({ stepStates }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Pipeline</h3>
      <ol className="grid gap-2.5 md:grid-cols-5">
        {STEPS.map((label, index) => {
          const state = stepStates[index] ?? 'pending'
          return (
            <li
              key={label}
              className={`rounded-2xl border px-3 py-3 text-sm transition ${stepStyle(state)} ${state === 'active' ? 'animate-pulse' : ''}`}
            >
              <p className="font-medium">{label}</p>
              <p className="mt-1 text-xs capitalize">{state}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
