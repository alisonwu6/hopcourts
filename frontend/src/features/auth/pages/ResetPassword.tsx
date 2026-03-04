import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { sessionService } from '@/services/sessionService'
import { useAuthStore } from '@/hooks'
import { Button, InputField } from '@/components'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { setAuthData } = useAuthStore()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase is not configured for this environment.')
      return
    }
    void ensureSession()
  }, [])

  const ensureSessionFromUrl = async () => {
    if (!supabase) return false

    // Hash-based tokens (#access_token=…)
    const hash = window.location.hash
    if (!hash.startsWith('#access_token')) return false
    const params = new URLSearchParams(hash.slice(1))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (!access_token || !refresh_token) return false
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })
      if (error) throw error
      if (data.session?.access_token) {
        const context = await sessionService.bootstrap(data.session.access_token)
        setAuthData(context.user, context.token)
      }
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      )
      setSessionReady(true)
      return true
    } catch (err: any) {
      setError(err?.message ?? 'Unable to resume Supabase session.')
      return false
    }
  }

  const ensureSessionFromQuery = async () => {
    if (!supabase) return false
    const params = new URLSearchParams(window.location.search)
    const recoveryToken = params.get('token') || params.get('code')
    const type = params.get('type')
    if (!recoveryToken || type !== 'recovery') return false
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(recoveryToken)
      if (error) throw error
      if (data.session?.access_token) {
        const context = await sessionService.bootstrap(data.session.access_token)
        setAuthData(context.user, context.token)
      }
      window.history.replaceState({}, document.title, window.location.pathname)
      setSessionReady(true)
      return true
    } catch (err: any) {
      setError(err?.message ?? 'Unable to resume Supabase session.')
      return false
    }
  }

  const ensureSession = async () => {
    const fromHash = await ensureSessionFromUrl()
    if (fromHash) return true
    return ensureSessionFromQuery()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    if (!password || password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    setError(null)
    setStatus(null)
    try {
      let ready = sessionReady
      if (!ready) {
        ready = await ensureSession()
      }
      if (!ready) {
        setError('Auth session missing! Please use the reset link from your email.')
        setSubmitting(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      const { data } = await supabase.auth.getSession()
      if (data?.session?.access_token) {
        const context = await sessionService.bootstrap(data.session.access_token)
        setAuthData(context.user, context.token)
      }
      setStatus('Password reset successful!')
      navigate('/profile', { replace: true })
    } catch (err: any) {
      setError(err?.message ?? 'Unable to update password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-player-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-2xl font-semibold text-player-900">Set a new password</h1>
        <p className="text-sm text-player-900/70">
          You will be signed in automatically after updating.
        </p>
        <InputField
          label="New Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
        <InputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {status && <p className="text-sm text-emerald-600">{status}</p>}
        <Button type="submit" className="w-full" disabled={submitting || !supabase}>
          {submitting ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </div>
  )
}
