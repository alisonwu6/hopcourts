import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { useAuthStore, useOnboardingStore } from '@/hooks'

const availableSports = ['Running', 'Basketball', 'Climbing', 'Yoga', 'Swimming']
const roleOptions = [
  {
    value: 'player' as const,
    title: 'Player',
    description: 'Find sessions, squads, and teammates to train with.',
  },
  {
    value: 'host' as const,
    title: 'Host',
    description: 'Create events, manage venues, and build your crew.',
  },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { signup, user, isLoading, error, clearError } = useAuthStore()
  const {
    role,
    setRole,
    preferredSports,
    toggleSport,
    hasCompletedOnboarding,
    completeOnboarding,
  } = useOnboardingStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user && hasCompletedOnboarding) {
      navigate('/home', { replace: true })
    }
  }, [user, hasCompletedOnboarding, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const selectedSports = preferredSports.length ? preferredSports : ['Running']
    await signup(name, email, password, selectedSports)
    const currentUser = useAuthStore.getState().user
    if (currentUser) {
      completeOnboarding({ role, preferredSports: selectedSports })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">Create your player card</h1>
        <p className="mt-2 text-sm text-slate-600">Tell us a little about you and we will match the right sessions.</p>

        <form className="mt-6 grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Name
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={name}
              onChange={(event) => {
                if (error) clearError()
                setName(event.target.value)
              }}
              required
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={email}
              onChange={(event) => {
                if (error) clearError()
                setEmail(event.target.value)
              }}
              required
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={password}
              onChange={(event) => {
                if (error) clearError()
                setPassword(event.target.value)
              }}
              required
            />
          </label>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-slate-700">How will you use SportsMatch?</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {roleOptions.map((option) => {
                const isActive = option.value === role
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                        : 'border-slate-300 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    <span className="block text-base font-semibold">{option.title}</span>
                    <span className={`mt-1 block text-sm ${isActive ? 'text-blue-600/80' : 'text-slate-500'}`}>
                      {option.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-slate-700">Pick your sports</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableSports.map((sport) => {
                const selected = preferredSports.includes(sport)
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selected ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    {sport}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="md:col-span-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating profile…' : 'Join SportsMatch'}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-blue-600 hover:underline" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
