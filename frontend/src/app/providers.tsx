import { PropsWithChildren, useEffect } from 'react'
import { useAuthStore } from '@/hooks'

// Wrap global providers here (AuthProvider, ToastProvider, QueryClientProvider, etc.)
export function AppProviders({ children }: PropsWithChildren) {
  const hydrate = useAuthStore((state) => state.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return <>{children}</>
}
