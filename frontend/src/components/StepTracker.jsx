const STEPS = [
  'Request Sent',
  'Generating Files (Gemini AI)',
  'Committing to GitHub',
  'Enabling GitHub Pages',
  'Deployment Live',
]

function stepStyle(state) {
  if (state === 'done') return 'bg-[#9df3c4] text-neo-ink'
  if (state === 'active') return 'bg-neo-secondary text-neo-ink animate-pulse'
  if (state === 'error') return 'bg-neo-accent text-neo-ink'
  return 'bg-white text-neo-ink'
}

export default function StepTracker({ stepStates }) {
  return (
    <div>
      <h3 className="mb-3 inline-block -rotate-1 border-4 border-neo-ink bg-neo-muted px-3 py-1 text-sm font-black uppercase tracking-widest">
        Pipeline
      </h3>
      <ol className="grid gap-2.5 md:grid-cols-5">
        {STEPS.map((label, index) => {
          const state = stepStates[index] ?? 'pending'
          return (
            <li
              key={label}
              className={`border-4 border-neo-ink px-3 py-3 text-sm font-bold shadow-neoSm transition duration-200 ease-linear hover:-translate-y-1 hover:shadow-neoMd ${stepStyle(state)}`}
            >
              <p className="font-black uppercase leading-tight">{label}</p>
              <p className="mt-1 text-xs capitalize">{state}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
