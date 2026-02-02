import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/hooks'

export function VenuePortalRouteGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return null

  if (!isAuthenticated) {
    // Redirect to login, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logic to ensure user is a venue manager could go here.
  // For now, we allow access and let the dashboard show "No venues managed" if empty.

  return <>{children}</>
}
