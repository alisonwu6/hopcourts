import { useCallback, useEffect, useRef } from 'react'

export function useInfiniteScroll(onLoadMore: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onLoadMore)
  callbackRef.current = onLoadMore

  useEffect(() => {
    if (!enabled) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callbackRef.current()
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled])

  return sentinelRef
}
