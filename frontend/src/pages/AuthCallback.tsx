import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { sessionService } from '@/services/sessionService'
import { useAuthStore } from '@/hooks'

export function AuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setAuthData } = useAuthStore()
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
        setAuthData(context.user, context.token, context.onboardingStatus)
        setOk('Signed in! Redirecting…')
        setTimeout(() => navigate('/', { replace: true }), 900)
      } catch (bootstrapError: any) {
        setErr(bootstrapError?.message ?? 'Unable to finish sign in.')
      } finally {
        setReady(true)
      }
    }

    void finalizeLogin()
  }, [queryType, navigate, setAuthData])

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
        setAuthData(context.user, context.token, context.onboardingStatus)
      }
      setOk('Password updated. Redirecting…')
      setTimeout(() => navigate('/', { replace: true }), 1200)
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
          <h1 className="text-2xl font-semibold text-player-900">Set a new password</h1>
          <p className="mt-2 text-sm text-player-900/70">Choose a new password to continue.</p>
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
            className="mt-4 w-full rounded-xl bg-player-600 py-3 text-white transition hover:bg-player-700 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating…' : 'Update password'}
          </button>
          {ok && <p className="mt-3 text-sm text-green-600">{ok}</p>}
          {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm rounded-2xl border border-player-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-player-100 border-t-player-600" />
        <p className="mt-4 text-sm text-player-900/70">
          {err ?? ok ?? 'Finishing sign in…'}
        </p>
      </div>
    </div>
  )
}
