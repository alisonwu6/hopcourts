import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '@/services/auth'
import { Button, InputField } from '@/components'
import logoUrl from '@/assets/sportsmatch.png'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setStatus(null)
    try {
      await resetPassword(email)
      setStatus('Check your inbox for a reset link.')
    } catch (err: any) {
      setError(err?.message ?? 'Unable to send reset email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-player-50 via-white to-player-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,199,44,0.2),_transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen items-start justify-center p-6">
        <main className="w-full max-w-md rounded-3xl bg-white/90 p-8 text-center shadow-xl backdrop-blur">
          <img className="mx-auto h-16 w-auto" src={logoUrl} alt="SportsMatch" />
          <div className="mt-4 space-y-2">
            <h1 className="text-2xl font-semibold text-player-900">Reset your password</h1>
            <p className="text-sm text-player-900/70">
              Enter the email address associated with your account and we&apos;ll send you a reset link.
            </p>
          </div>

          <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit}>
            <InputField
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              name="email"
              autoComplete="email"
            />

            {status && <p className="text-sm text-green-600">{status}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending link…' : 'Send reset link'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-player-900/70">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-player-600 hover:text-player-700">
              Back to login
            </Link>
          </p>
        </main>
      </div>
    </div>
  )
}
