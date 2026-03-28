import { useEffect, useState } from 'react'

export function useHealthCheck(backendUrl) {
  const [status, setStatus] = useState('unchecked')
  const [message, setMessage] = useState('Health check not run yet.')

  useEffect(() => {
    if (!backendUrl) {
      setStatus('unchecked')
      setMessage('Backend URL is not set.')
      return undefined
    }

    let cancelled = false

    const check = async () => {
      try {
        const response = await fetch(`${backendUrl}/health`)
        if (!response.ok) {
          throw new Error(`Health check failed with ${response.status}`)
        }
        const data = await response.json()
        if (!cancelled) {
          setStatus(data.status === 'ok' ? 'online' : 'offline')
          setMessage(data.status === 'ok' ? 'Backend reachable.' : 'Backend responded but not healthy.')
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('offline')
          setMessage(error instanceof Error ? error.message : 'Backend unreachable.')
        }
      }
    }

    check()
    const intervalId = setInterval(check, 10000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [backendUrl])

  return { healthStatus: status, healthMessage: message }
}
