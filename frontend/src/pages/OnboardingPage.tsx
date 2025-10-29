import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { useAuthStore } from '@/hooks'

const availableSports = ['Running', 'Basketball', 'Climbing', 'Yoga', 'Swimming']

export function OnboardingPage() {
  const navigate = useNavigate()
  const { signup, user, isLoading, error, clearError } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sports, setSports] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [user, navigate])

  const toggleSport = (sport: string) => {
    setSports((prev) => (prev.includes(sport) ? prev.filter((item) => item !== sport) : [...prev, sport]))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await signup(name, email, password, sports.length ? sports : ['Running'])
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
            <p className="text-sm font-medium text-slate-700">Pick your sports</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableSports.map((sport) => {
                const selected = sports.includes(sport)
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
