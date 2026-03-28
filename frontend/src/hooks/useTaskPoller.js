import { useEffect, useState } from 'react'

export function useTaskPoller({ backendUrl, taskId, enabled }) {
  const [result, setResult] = useState({ status: 'idle' })
  const [networkError, setNetworkError] = useState('')

  useEffect(() => {
    if (!enabled || !backendUrl || !taskId) {
      setResult({ status: 'idle' })
      setNetworkError('')
      return undefined
    }

    let cancelled = false

    const poll = async () => {
      try {
        const response = await fetch(`${backendUrl}/result/${encodeURIComponent(taskId)}`)
        if (!response.ok) {
          throw new Error(`Result polling failed with ${response.status}`)
        }
        const data = await response.json()
        if (!cancelled) {
          setResult(data)
          setNetworkError('')
        }
      } catch (error) {
        if (!cancelled) {
          setNetworkError(error instanceof Error ? error.message : 'Failed to poll task result.')
        }
      }
    }

    poll()
    const intervalId = setInterval(poll, 3000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [backendUrl, taskId, enabled])

  return { result, networkError }
}
