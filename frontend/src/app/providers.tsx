import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks'
import { supabase } from '@/lib/supabase'
import { setOnUnauthorized } from '@/api/http'
import { useLocation, useNavigate } from 'react-router-dom'
import { registerServiceWorker } from '@/services/pushService'
import { queryClient } from '@/lib/queryClient'
import { AppUpdateBanner } from '@/components/AppUpdateBanner'

// Wrap global providers here (AuthProvider, ToastProvider, QueryClientProvider, etc.)
export function AppProviders({ children }: PropsWithChildren) {
  const hydrate = useAuthStore((state) => state.hydrate)
  const setAuthData = useAuthStore((state) => state.setAuthData)
  const clearAuthState = useAuthStore((state) => state.clearAuthState)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  const handledUnauthorizedRef = useRef(false)
  const [updateReady, setUpdateReady] = useState(false)
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (location.pathname === '/login' || isAuthenticated) {
      handledUnauthorizedRef.current = false
    }
  }, [location.pathname, isAuthenticated])

  // Run exactly once on mount: bootstrap auth + register SW
  useEffect(() => {
    registerServiceWorker(() => setUpdateReady(true)).then((reg) => {
      if (reg) swRegistrationRef.current = reg
    })
    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update the 401 handler whenever navigate reference changes (route transitions)
  useEffect(() => {
    setOnUnauthorized(() => {
      if (handledUnauthorizedRef.current) return
      handledUnauthorizedRef.current = true

      useAuthStore.getState().clearAuthState()

      const path = window.location.pathname
      const onPublicProfileSurface = path === '/profile' || path.startsWith('/profile/')

      if (path !== '/login' && !onPublicProfileSurface) {
        navigate('/login', {
          replace: true,
          state: { from: `${path}${window.location.search}` },
        })
      }
    })
    return () => setOnUnauthorized(() => {})
  }, [navigate])

  // Subscribe to Supabase auth events for token refresh and sign-out
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          setAuthData(currentUser, session.access_token, { remember: true })
        }
      } else if (event === 'SIGNED_OUT') {
        clearAuthState()
      }
    })
    return () => subscription.unsubscribe()
  }, [setAuthData, clearAuthState])

  const handleUpdate = () => {
    const reg = swRegistrationRef.current
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload())
    } else {
      window.location.reload()
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      {updateReady && <AppUpdateBanner onUpdate={handleUpdate} />}
      {children}
    </QueryClientProvider>
  )
}
