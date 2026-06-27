import { PropsWithChildren, useEffect, useRef } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/hooks'
import { supabase } from '@/lib/supabase'
import { setOnUnauthorized } from '@/api/http'
import { useLocation, useNavigate } from 'react-router-dom'
import { registerServiceWorker } from '@/services/pushService'
import { queryClient } from '@/lib/queryClient'

export function AppProviders({ children }: PropsWithChildren) {
  const hydrate = useAuthStore((state) => state.hydrate)
  const setAuthData = useAuthStore((state) => state.setAuthData)
  const clearAuthState = useAuthStore((state) => state.clearAuthState)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  const handledUnauthorizedRef = useRef(false)

  useEffect(() => {
    if (location.pathname === '/login' || isAuthenticated) {
      handledUnauthorizedRef.current = false
    }
  }, [location.pathname, isAuthenticated])

  useEffect(() => {
    void registerServiceWorker()
    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
