import { PropsWithChildren } from 'react'

// Page container (e.g., bottom nav + layout chrome)
export function AppShell({ children }: PropsWithChildren) {
  return <div className="min-h-[100dvh] bg-slate-50">{children}</div>
}
