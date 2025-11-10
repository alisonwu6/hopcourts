import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, InputField } from '@/components'
import { useAuthStore } from '@/hooks'
import { signInWithGoogle, signInWithApple } from '@/services/auth'
import logoUrl from '@/assets/sportsmatch.png'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import AppleLoginButton from '@/components/button/AppleLoginButton'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, onboardingStatus, isAuthenticated, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      if (onboardingStatus?.isComplete) {
        navigate('/home', { replace: true })
      } else {
        navigate('/onboarding', { replace: true })
      }
    }
  }, [isAuthenticated, onboardingStatus?.isComplete, navigate])

  const loginGoogle = async () => {
    try {
      const { data, error } = await signInWithGoogle()
      if (error) {
        throw new Error(error.message)
      }
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? 'Unable to start Google login.')
    }
  }

  const loginApple = async () => {
    try {
      const { data, error } = await signInWithApple()
      if (error) {
        throw new Error(error.message)
      }
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      console.error(err)
      alert(err?.message ?? 'Unable to start Apple login.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await login(email, password, rememberMe)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-player-50 via-white to-player-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,199,44,0.2),_transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen items-start justify-center p-6">
        <main className="w-full max-w-md rounded-3xl bg-white/90 p-8 text-center shadow-xl backdrop-blur">
          <img
            className="mx-auto h-16 w-auto"
            src={logoUrl}
            alt="SportsMatch"
          />
          <div className="mt-2 space-y-2">
            <h1 className="text-2xl font-semibold text-player-900">
              {/* Join the movement. */}
            </h1>
            <p className="text-sm text-player-900/70">
              {/* SportsMatch rallies athletes to keep every game energized—match
              up, follow through, and build the crew that pushes you further. */}
            </p>
          </div>

          <form
            className="mt-4 space-y-4 text-left"
            onSubmit={handleSubmit}
          >
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

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="inline-flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-player-200 text-player-600 focus:ring-player-600"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="font-semibold text-player-600 hover:text-player-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in…' : 'Login'}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs uppercase tracking-wide text-player-900/40">
              or
            </span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <div className="flex w-full max-w-sm flex-col gap-3">
            <GoogleLoginButton loginGoogle={loginGoogle} />
            <AppleLoginButton loginApple={loginApple} />
          </div>

          <p className="mt-6 text-center text-sm text-player-900/70">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-player-600 hover:text-player-700"
            >
              Sign up
            </Link>
          </p>
        </main>
      </div>
    </div>
  )
}
