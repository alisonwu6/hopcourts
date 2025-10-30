import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, InputField } from '@/components'
import { useAuthStore } from '@/hooks'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, user, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [navigate, user])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await login(email, password)
  }

  return (
    <div className="flex min-h-screen flex-col bg-player-50">
      <div className="px-4 py-4">
        <h1 className="text-lg font-bold text-player-900">Login</h1>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-player-900">SportsMatch</h2>
            <p className="mt-2 text-player-600">Find your sport buddy</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
              error={error ?? undefined}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => {
                if (error) clearError()
                setPassword(event.target.value)
              }}
              name="password"
              autoComplete="current-password"
            />

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-player-200 text-player-600 focus:ring-player-600"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in…' : 'Login'}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-2 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <span>🔍</span>
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <span>🍎</span>
              <span>Continue with Apple</span>
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-player-600 hover:text-player-700">
              Sign up
            </Link>
          </p>
          <p className="mt-3 text-center text-sm">
            <Link to="/forgot-password" className="text-player-600 hover:text-player-700">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
