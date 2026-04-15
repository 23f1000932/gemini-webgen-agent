import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import ProgressView from './components/ProgressView'
import SettingsModal from './components/SettingsModal'
import TaskForm from './components/TaskForm'
import { useHealthCheck } from './hooks/useHealthCheck'
import { useSettings } from './hooks/useSettings'
import { useTaskPoller } from './hooks/useTaskPoller'

function slugifyTask(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getStepStates(stage, resultStatus) {
  if (stage === 'idle') {
    return ['pending', 'pending', 'pending', 'pending', 'pending']
  }

  if (stage === 'submitting') {
    return ['active', 'pending', 'pending', 'pending', 'pending']
  }

  if (resultStatus === 'failed') {
    return ['done', 'error', 'pending', 'pending', 'pending']
  }

  if (resultStatus === 'done') {
    return ['done', 'done', 'done', 'done', 'done']
  }

  return ['done', 'active', 'active', 'active', 'pending']
}

function sanitizeBackendUrl(value) {
  return value.trim().replace(/\/+$/, '')
}

function resolveBackendUrl(value) {
  const sanitized = sanitizeBackendUrl(value)
  if (sanitized) return sanitized
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

function App() {
  const { settings, draft, setDraft, hasUnsavedChanges, saveSettings, resetDraft } = useSettings()
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem('webgen-theme') || 'light'
  })
  const [submitError, setSubmitError] = useState('')
  const [taskState, setTaskState] = useState({
    stage: 'idle',
    taskId: '',
    result: null,
  })
  const [form, setForm] = useState({
    task: '',
    brief: '',
    attachments: [],
  })

  const backendUrl = resolveBackendUrl(settings.backendUrl)
  const healthCheckUrl = showSettings ? resolveBackendUrl(draft.backendUrl) : backendUrl
  const { healthStatus, healthMessage } = useHealthCheck(healthCheckUrl)
  const { result, networkError } = useTaskPoller({
    backendUrl,
    taskId: taskState.taskId,
    enabled: taskState.stage === 'polling',
  })

  const effectiveResult = taskState.stage === 'polling' ? result : taskState.result

  const deployPreviewUrl = useMemo(() => {
    const user = settings.githubUsername || '<github_username>'
    const task = slugifyTask(form.task) || '<task-id>'
    return `https://${user}.github.io/${task}/`
  }, [settings.githubUsername, form.task])

  const stepStates = getStepStates(taskState.stage, effectiveResult?.status)

  const updateFormField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'task' ? slugifyTask(value) : value,
    }))
  }

  const addAttachments = (incoming) => {
    setForm((current) => ({
      ...current,
      attachments: [...current.attachments, ...incoming],
    }))
  }

  const removeAttachment = (indexToRemove) => {
    setForm((current) => ({
      ...current,
      attachments: current.attachments.filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleSubmit = async () => {
    setSubmitError('')
    if (!settings.email) {
      setSubmitError('Please set Email in Settings.')
      return
    }
    if (!form.task || !form.brief.trim()) {
      setSubmitError('Task ID and Brief are required.')
      return
    }

    const payload = {
      task: slugifyTask(form.task),
      email: settings.email,
      round: 1,
      brief: form.brief.trim(),
      attachments: form.attachments.map(({ name, url }) => ({ name, url })),
    }
    const headers = { 'Content-Type': 'application/json' }
    if (settings.apiKey) {
      headers['X-API-Key'] = settings.apiKey
    }

    try {
      setTaskState({ stage: 'submitting', taskId: '', result: null })
      const response = await fetch(`${backendUrl}/ready`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `Request failed with ${response.status}`)
      }
      const queued = await response.json()
      if (!queued.task_id) {
        throw new Error('Backend did not return task_id.')
      }

      setTaskState({ stage: 'polling', taskId: queued.task_id, result: null })
    } catch (error) {
      setTaskState({ stage: 'idle', taskId: '', result: null })
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit task.')
    }
  }

  useEffect(() => {
    if (taskState.stage === 'polling' && (result?.status === 'done' || result?.status === 'failed')) {
      setTaskState((current) => ({
        ...current,
        stage: 'complete',
        result,
      }))
    }
  }, [taskState.stage, result])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('webgen-theme', theme)
  }, [theme])

  const resetTask = () => {
    setTaskState({ stage: 'idle', taskId: '', result: null })
    setSubmitError('')
  }

  return (
    <div className="min-h-full">
      <Header
        healthStatus={healthStatus}
        healthMessage={healthMessage}
        onOpenSettings={() => setShowSettings(true)}
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-14">
        {taskState.stage === 'idle' ? (
          <>
            <section className="relative mb-8 overflow-hidden border-4 border-neo-ink bg-white p-6 shadow-neoLg md:p-10">
              <div className="absolute -right-10 -top-10 h-24 w-24 rotate-12 border-4 border-neo-ink bg-neo-accent" aria-hidden="true" />
              <div className="absolute -bottom-8 left-10 h-16 w-16 -rotate-12 border-4 border-neo-ink bg-neo-muted" aria-hidden="true" />

              <p className="inline-block -rotate-1 border-4 border-neo-ink bg-neo-secondary px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">
                Autonomous App Builder
              </p>
              <h2 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.9] tracking-tight md:text-7xl">
                Build, Deploy,
                <span className="ml-2 inline-block rotate-1 border-4 border-neo-ink bg-neo-accent px-3">Ship</span>
                <br />
                With One Prompt
              </h2>
              <p className="mt-5 max-w-3xl border-l-4 border-neo-ink pl-4 text-base font-bold md:text-xl">
                WebGen Agent receives your idea, generates your website with Gemini, pushes to GitHub, and makes it live on
                GitHub Pages automatically.
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {[
                  ['1', 'Reads your brief + attachments'],
                  ['2', 'Generates production-ready files'],
                  ['3', 'Deploys and returns live URL'],
                ].map(([number, text]) => (
                  <article
                    key={number}
                    className="border-4 border-neo-ink bg-neo-bg p-4 shadow-neoSm transition duration-200 ease-linear hover:-translate-y-1 hover:shadow-neoMd"
                  >
                    <p className="inline-block border-4 border-neo-ink bg-neo-muted px-2 py-0.5 text-sm font-black">{number}</p>
                    <p className="mt-2 text-sm font-bold uppercase">{text}</p>
                  </article>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('task-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="neo-button mt-8 bg-neo-accent text-base"
              >
                Try the Agent
              </button>
            </section>

            <section id="task-form-section">
              <TaskForm
                form={form}
                onFieldChange={updateFormField}
                onAddAttachments={addAttachments}
                onRemoveAttachment={removeAttachment}
                onSubmit={handleSubmit}
                submitDisabled={false}
                submitLabel="Generate and Deploy"
                deployPreviewUrl={deployPreviewUrl}
              />
              {submitError ? (
                <p className="mt-3 border-4 border-neo-ink bg-neo-accent px-3.5 py-2.5 text-sm font-bold text-neo-ink">
                  {submitError}
                </p>
              ) : null}
            </section>
          </>
        ) : (
          <ProgressView
            stepStates={stepStates}
            result={effectiveResult}
            networkError={networkError}
            backendUrl={backendUrl}
            onReset={resetTask}
          />
        )}
      </main>

      <SettingsModal
        open={showSettings}
        draft={draft}
        onChange={(field, value) => setDraft((current) => ({ ...current, [field]: value }))}
        onSave={() => {
          saveSettings()
          setShowSettings(false)
        }}
        onClose={() => {
          resetDraft()
          setShowSettings(false)
        }}
        hasUnsavedChanges={hasUnsavedChanges}
        healthStatus={healthStatus}
        healthMessage={healthMessage}
      />
    </div>
  )
}

export default App
