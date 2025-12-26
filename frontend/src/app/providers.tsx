import { PropsWithChildren } from 'react'

// Wrap global providers here (AuthProvider, ToastProvider, QueryClientProvider, etc.)
export function AppProviders({ children }: PropsWithChildren) {
  return <>{children}</>
}
