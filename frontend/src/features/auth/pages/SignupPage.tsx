import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, InputField } from '@/components'
import { useAuthStore } from '@/hooks'
import logoUrl from '@/assets/logo.png'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true })
    }
  }, [isAuthenticated, navigate])

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
    await signup(name, email, password)
  }

  const effectiveError = formError ?? error ?? undefined

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-player-50 via-white to-player-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,199,44,0.2),_transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen items-start justify-center p-6">
        <main className="w-full max-w-md rounded-3xl bg-white/90 p-8 text-center shadow-xl backdrop-blur">
          <img className="mx-auto h-16 w-auto" src={logoUrl} alt="SportsMatch" />
          <div className="mt-3 space-y-2">
            {/* <h1 className="text-2xl font-semibold text-player-900">Join the movement.</h1> */}
            <p className="text-sm text-player-900/70">
              SportsMatch 想讓大家都更愛動起來——和在地夥伴配對、說好就玩，幫你一路維持動力。
            </p>
          </div>

          <form className="mt-4 space-y-4 text-left" onSubmit={handleSubmit}>
            <InputField
              label="姓名"
              type="text"
              placeholder="王小明"
              value={name}
              onChange={(event) => {
                if (error) clearError()
                setName(event.target.value)
              }}
              name="name"
              autoComplete="name"
            />
            <InputField
              label="Email"
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
              label="密碼"
              type="password"
              placeholder="至少 8 碼"
              hint="需包含大小寫英文字母與數字"
              value={password}
              onChange={(event) => {
                if (error) clearError()
                setPassword(event.target.value)
              }}
              name="password"
              autoComplete="new-password"
            />
            <InputField
              label="再次輸入密碼"
              type="password"
              placeholder="請再輸入一次密碼"
              value={confirmPassword}
              onChange={(event) => {
                if (error) clearError()
                setConfirmPassword(event.target.value)
              }}
              name="confirm-password"
              autoComplete="new-password"
            />

            <div className="flex items-start gap-3 rounded-xl border border-player-100 bg-white p-4 text-left text-sm text-player-900/70">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-player-200 text-player-600 focus:ring-player-600"
              />
              <label htmlFor="terms">
                我同意
                <a href="#" className="font-semibold text-player-600 ">
                  服務條款
                </a>{' '}
                與{' '}
                <a href="#" className="font-semibold text-player-600 ">
                  隱私權政策
                </a>
              </label>
            </div>

            {effectiveError && <p className="text-sm text-red-500">{effectiveError}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '建立帳號中…' : '建立帳號'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-player-900/70">
            已經有帳號了？{' '}
            <Link to="/login" className="font-semibold text-player-600 ">
              立即登入
            </Link>
          </p>
        </main>
      </div>
    </div>
  )
}
