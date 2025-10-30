import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InputField } from '@/components'
import { useAuthStore } from '@/hooks'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup, isLoading, error, clearError } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }
    if (!acceptedTerms) {
      setFormError('You must accept the terms to create an account')
      return
    }
    setFormError(null)
    await signup(name, email, password, ['Running'])
    if (useAuthStore.getState().user) {
      navigate('/onboarding')
    }
  }

  const effectiveError = formError ?? error ?? undefined

  return (
    <div className="flex min-h-screen flex-col bg-player-50">
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xl text-player-600 transition hover:text-player-700"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-player-900">Create Account</h1>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-player-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">Start building your SportsMatch crew.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <InputField
              label="Full Name"
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(event) => {
                if (error) clearError()
                setName(event.target.value)
              }}
              name="name"
              autoComplete="name"
            />
            <InputField
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                if (error) clearError()
                setEmail(event.target.value)
              }}
              name="email"
              autoComplete="email"
            />
            <InputField
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              hint="Must contain uppercase, lowercase, and number"
              value={password}
              onChange={(event) => {
                if (error) clearError()
                setPassword(event.target.value)
              }}
              name="password"
              autoComplete="new-password"
            />
            <InputField
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(event) => {
                if (error) clearError()
                setConfirmPassword(event.target.value)
              }}
              name="confirm-password"
              autoComplete="new-password"
            />

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-player-200 text-player-600 focus:ring-player-600"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-player-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-player-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {effectiveError && <p className="text-sm text-red-500">{effectiveError}</p>}

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-player-600 py-3 font-bold text-white transition hover:bg-player-700 disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-player-600 hover:text-player-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
