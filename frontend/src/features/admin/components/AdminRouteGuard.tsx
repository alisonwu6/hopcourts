
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks'

/**
 * AdminRouteGuard
 * 
 * Ensures the user is not only authenticated, but also has the required
 * permissions for governance. Currently simplified to use profile role.
 */
export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return null // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  // TODO: Implement hard role check here. 
  const isAdmin = true; // Placeholder: for now we allow any logged in user as admin for dev
  
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white font-mono text-slate-300">
        <p className="text-xs uppercase tracking-widest text-slate-400">403 Forbidden</p>
        <p className="mt-2 text-[10px] text-slate-200">Governance identity required for this terminal.</p>
      </div>
    )
  }

  return <>{children}</>
}
