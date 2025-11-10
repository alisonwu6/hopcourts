import { ReactNode, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { sessionService } from '@/services/sessionService'
import { useOnboardingStore } from '@/store/onboardingStore'

interface OnboardingRouteProps {
  children: ReactNode
}

export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const navigate = useNavigate()
  const { isAuthenticated, user, onboardingStatus, isLoading: authLoading } = useAuthStore()
  const {
    status,
    initializeOnboarding,
    isLoading: onboardingLoading,
    setLoading,
    setError,
  } = useOnboardingStore()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }

    const loadStatus = async () => {
      try {
        setLoading(true)
        const remoteStatus = onboardingStatus ?? (await sessionService.getOnboardingStatus())
        initializeOnboarding(remoteStatus, {
          fullName: user?.name ?? '',
          role: user && (user.managedVenues?.length ?? 0) > 0 ? 'venue_manager' : null,
          username: (user as any)?.username ?? '',
        })
      } catch (error: any) {
        setError(error?.message ?? 'Unable to load onboarding status')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && !status && !onboardingLoading) {
      void loadStatus()
    }
  }, [isAuthenticated, user, status, onboardingStatus, onboardingLoading, navigate, setLoading, setError, initializeOnboarding])

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (authLoading || onboardingLoading || !status) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-player-200 border-t-player-600" />
        <p className="mt-4 text-sm text-player-900/70">Loading onboarding...</p>
      </div>
    )
  }

  if (status.isComplete) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}
