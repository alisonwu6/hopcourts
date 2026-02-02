import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components'
import { LoginPanel } from '@/components/LoginPanel'
import { useAuthStore } from '@/hooks'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { onboardingStatus, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      // Check if there is a pending redirect
      const from = (location.state as any)?.from?.pathname || null
      
      if (from && from !== '/') {
        navigate(from, { replace: true })
        return
      }

      // Default logic: always go to profile after login
      navigate('/profile', { replace: true })
    }
  }, [isAuthenticated, onboardingStatus?.isComplete, navigate, location])

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-4 py-3 text-center">
          <p className="text-sm font-semibold text-slate-600">登入</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
        <LoginPanel />
      </div>
    </div>
  )
}
