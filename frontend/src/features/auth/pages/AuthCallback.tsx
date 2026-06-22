import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { sessionService } from '@/services/sessionService'
import { useAuthStore } from '@/hooks'
import { PageLoading } from '@/components/PageLoading'

const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect'

export function AuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()
  const setAuthData = useAuthStore((state) => state.setAuthData)
  const [ready, setReady] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasFinalizedRef = useRef(false)

  const queryType = useMemo(() => new URLSearchParams(location.search).get('type'), [location.search])

  useEffect(() => {
    if (queryType === 'recovery') {
      setReady(true)
      return
    }
    if (hasFinalizedRef.current) return
    hasFinalizedRef.current = true

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

        // Prefer URL query (?returnTo=) — it survives any session-storage
        // wipe during the OAuth redirect chain. Fall back to sessionStorage.
        let redirectPath: string | null = null
        try {
          const urlReturnTo = new URLSearchParams(location.search).get('returnTo')
          if (urlReturnTo && urlReturnTo.startsWith('/')) {
            redirectPath = urlReturnTo
          } else {
            const storedPath = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
            if (storedPath && storedPath.startsWith('/')) {
              redirectPath = storedPath
            }
          }
          sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
        } catch (storageError) {
          console.warn('Failed to read post-login redirect path:', storageError)
        }

        const isOnboarded = !!context.user?.onboarding_completed_at
        const allowsIncompleteProfile = !!redirectPath?.startsWith('/venues/submit')
        if (redirectPath && (isOnboarded || allowsIncompleteProfile)) {
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
  }, [queryType, navigate, setAuthData, location.search])

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
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 p-4">
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

  if (err && ready) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Sign-in didn't complete</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-600">{err}</p>
        <p className="mt-2 max-w-sm text-xs text-slate-500">
          If you're using the home-screen app, try signing in through Safari first, then reopen the app.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Back to home
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return <PageLoading message={ok ?? 'Signing in...'} />
}
