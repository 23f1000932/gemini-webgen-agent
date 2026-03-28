import { useMemo, useState } from 'react'

const STORAGE_KEY = 'webgen-agent-settings'

const DEFAULT_SETTINGS = {
  backendUrl: '',
  email: '',
  apiKey: '',
  githubToken: '',
  githubUsername: '',
}

function sanitizeBackendUrl(value) {
  return value.trim().replace(/\/+$/, '')
}

function readInitialSettings() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return DEFAULT_SETTINGS
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      backendUrl: sanitizeBackendUrl(parsed.backendUrl ?? DEFAULT_SETTINGS.backendUrl),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(readInitialSettings)
  const [draft, setDraft] = useState(settings)

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(settings),
    [draft, settings],
  )

  const saveSettings = () => {
    const next = {
      ...draft,
      backendUrl: sanitizeBackendUrl(draft.backendUrl),
      email: draft.email.trim(),
      githubToken: draft.githubToken.trim(),
      githubUsername: draft.githubUsername.trim(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSettings(next)
    setDraft(next)
    return next
  }

  const resetDraft = () => {
    setDraft(settings)
  }

  return {
    settings,
    draft,
    setDraft,
    hasUnsavedChanges,
    saveSettings,
    resetDraft,
  }
}
