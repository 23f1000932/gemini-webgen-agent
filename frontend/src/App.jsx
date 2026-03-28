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

  const resetTask = () => {
    setTaskState({ stage: 'idle', taskId: '', result: null })
    setSubmitError('')
  }

  return (
    <div className="min-h-full">
      <Header healthStatus={healthStatus} healthMessage={healthMessage} onOpenSettings={() => setShowSettings(true)} />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-14">
        {taskState.stage === 'idle' ? (
          <>
            <section className="mb-7 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_-50px_rgba(14,165,233,0.45)] backdrop-blur-xl md:p-8">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">What would you like to build?</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300/90 md:text-base">
                Start with a task name and describe your app idea. WebGen Agent will generate, publish, and share the live URL.
              </p>
            </section>

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
              <p className="mt-3 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-100">
                {submitError}
              </p>
            ) : null}
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
