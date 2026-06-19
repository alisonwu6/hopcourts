import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { sessionService } from '@/services/sessionService'
import { useAuthStore } from '@/hooks'
import { PageLoading } from '@/components/PageLoading'

const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect'

export function AuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setAuthData, isAuthenticated } = useAuthStore()
  const [ready, setReady] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queryType = useMemo(() => new URLSearchParams(location.search).get('type'), [location.search])

  useEffect(() => {
    if (queryType === 'recovery') {
      setReady(true)
      return
    }

    const finalizeLogin = async () => {
      if (!supabase) {
        setErr('Supabase is not configured.')
        setReady(true)
        return
      }
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session?.access_token) {
        setErr(error?.message ?? 'Missing Supabase session.')
        setReady(true)
        return
      }
      try {
        const context = await sessionService.bootstrap(data.session.access_token)
        setAuthData(context.user, context.token)
        setOk('Signed in successfully! Redirecting...')
        let redirectPath: string | null = null
        try {
          const storedPath = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
          if (storedPath && storedPath.startsWith('/')) {
            redirectPath = storedPath
          }
          sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
        } catch (storageError) {
          console.warn('Failed to read post-login redirect path:', storageError)
        }

        const isOnboarded = !!context.user?.onboarding_completed_at
        if (isOnboarded && redirectPath) {
          navigate(redirectPath, { replace: true })
          return
        }

        navigate('/profile', {
          replace: true,
          state: isOnboarded ? undefined : { openEdit: true, returnTo: redirectPath },
        })
      } catch (bootstrapError: any) {
        setErr(bootstrapError?.message ?? 'Unable to finish sign in.')
      } finally {
        setReady(true)
      }
    }

    void finalizeLogin()
  }, [queryType, navigate, setAuthData, isAuthenticated])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) {
      setErr('Supabase is not configured.')
      return
    }
    setIsSubmitting(true)
    setErr(null)
    setOk(null)
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') ?? '')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setErr(error.message)
      setIsSubmitting(false)
      return
    }
    try {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.access_token) {
        const context = await sessionService.bootstrap(data.session.access_token)
        setAuthData(context.user, context.token)
      }
      setOk('Password updated. Redirecting...')
      navigate('/profile', { replace: true })
    } catch (bootstrapError: any) {
      setErr(bootstrapError?.message ?? 'Password updated but failed to refresh session.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (queryType === 'recovery' && ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
        >
          <h1 className="text-2xl font-semibold text-player-900">Set New Password</h1>
          <p className="mt-2 text-sm text-player-900/70">Please enter a new password to continue.</p>
          <input
            name="password"
            type="password"
            placeholder="New password"
            minLength={10}
            required
            className="mt-6 w-full rounded-xl border border-player-100 px-4 py-3 focus:border-player-500 focus:outline-none"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-player-600 py-3 text-white transition disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update password'}
          </button>
          {ok && <p className="mt-3 text-sm text-green-600">{ok}</p>}
          {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
        </form>
      </div>
    )
  }

  return <PageLoading message={err ?? ok ?? 'Signing in...'} />
}
