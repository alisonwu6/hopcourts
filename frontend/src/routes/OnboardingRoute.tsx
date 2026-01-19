import { ReactNode, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks'
import { sessionService } from '@/services/sessionService'
import { useOnboardingStore } from '@/hooks'

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
    if (!isAuthenticated) return

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
  }, [
    isAuthenticated,
    user,
    status,
    onboardingStatus,
    onboardingLoading,
    navigate,
    setLoading,
    setError,
    initializeOnboarding,
  ])

  if (!isAuthenticated) {
    return <>{children}</>
  }

  if (authLoading || onboardingLoading || !status) {
    return <>{children}</>
  }

  // todo - temp comment for showing the onboarding page
  // if (status.isComplete) {
  //   return <Navigate to="/" replace />
  // }

  return <>{children}</>
}
