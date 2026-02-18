import { PropsWithChildren, useEffect } from 'react'
import { useAuthStore } from '@/hooks'
import { supabase } from '@/lib/supabase'
import { setOnUnauthorized } from '@/api/http'

// Wrap global providers here (AuthProvider, ToastProvider, QueryClientProvider, etc.)
export function AppProviders({ children }: PropsWithChildren) {
  const hydrate = useAuthStore((state) => state.hydrate)
  const setAuthData = useAuthStore((state) => state.setAuthData)
  const clearAuthState = useAuthStore((state) => state.clearAuthState)

  useEffect(() => {
    hydrate()

    // Handle 401 from backend API
    setOnUnauthorized(() => {
      useAuthStore.getState().clearAuthState()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] State changed:', event)
      if (event === 'TOKEN_REFRESHED' && session) {
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          setAuthData(currentUser, session.access_token, { remember: true })
        }
      } else if (event === 'SIGNED_OUT') {
        clearAuthState()
      }
    })

    return () => {
      subscription.unsubscribe()
      setOnUnauthorized(() => {}) // Cleanup? Or leave empty fn
    }
  }, [hydrate, setAuthData, clearAuthState])

  return <>{children}</>
}
