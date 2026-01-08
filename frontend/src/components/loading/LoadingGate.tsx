import type { ReactNode } from 'react'
import { useLoadingGate, type LoadingGateOptions } from '@/hooks/useLoadingGate'

type LoadingGateProps = {
  loading: boolean
  fallback: ReactNode
  children: ReactNode
  options?: LoadingGateOptions
}

export function LoadingGate({ loading, fallback, children, options }: LoadingGateProps) {
  const show = useLoadingGate(loading, options)
  if (show) return <>{fallback}</>
  return <>{children}</>
}
