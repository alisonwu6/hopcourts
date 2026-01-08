import { useEffect, useRef, useState } from 'react'

export type LoadingGateOptions = {
  delayMs?: number
  minDurationMs?: number
}

/**
 * useLoadingGate
 * Adds a delay before showing loading, and enforces a minimum visible duration once shown.
 * Helps avoid flicker when requests resolve quickly.
 */
export function useLoadingGate(isLoading: boolean, options: LoadingGateOptions = {}): boolean {
  const delayMs = options.delayMs ?? 200
  const minDurationMs = options.minDurationMs ?? 500

  const [show, setShow] = useState(false)
  const showTimestampRef = useRef<number | null>(null)
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Clear timers on unmount
    return () => {
      if (delayTimer.current) clearTimeout(delayTimer.current)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  useEffect(() => {
    if (isLoading) {
      // If already showing, do nothing
      if (show) return
      // Wait for delay; if still loading, show
      delayTimer.current = setTimeout(() => {
        showTimestampRef.current = Date.now()
        setShow(true)
      }, delayMs)
    } else {
      // If not loading and not shown yet, clear delay timer
      if (!show) {
        if (delayTimer.current) clearTimeout(delayTimer.current)
        return
      }
      // Enforce minimum duration
      const elapsed = showTimestampRef.current ? Date.now() - showTimestampRef.current : minDurationMs
      const remaining = Math.max(minDurationMs - elapsed, 0)
      hideTimer.current = setTimeout(() => {
        showTimestampRef.current = null
        setShow(false)
      }, remaining)
    }
  }, [isLoading, delayMs, minDurationMs, show])

  return show
}
