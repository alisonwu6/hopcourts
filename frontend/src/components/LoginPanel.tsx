import { FormEvent, useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { Button, InputField } from '@/components'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import AppleLoginButton from '@/components/button/AppleLoginButton'
import { useAuthStore } from '@/hooks'
import { signInWithGoogle, signInWithApple } from '@/services/authService'

type Props = {
  className?: string
  variant?: 'card' | 'sheet'
}

export function LoginPanel({ className, variant = 'card' }: Props) {
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(variant !== 'sheet')

  const containerClass = clsx(
    'rounded-[32px] border border-slate-100 bg-white shadow-[0_25px_70px_rgba(15,41,77,0.08)] px-6 py-6 sm:px-8',
    variant === 'sheet' && 'border-none shadow-none px-0',
    className
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await login(email, password, false)
  }

  const loginGoogle = async () => {
    const { data, error: googleError } = await signInWithGoogle()
    if (googleError) {
      alert(googleError.message)
      return
    }
    if (data?.url) window.location.href = data.url
  }

  const loginApple = async () => {
    const { data, error: appleError } = await signInWithApple()
    if (appleError) {
      alert(appleError.message)
      return
    }
    if (data?.url) window.location.href = data.url
  }

  if (!showEmailForm && variant === 'sheet') {
    return (
      <section className={containerClass}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">先登入，建立你的運動身份</h1>
          <p className="mt-2 text-sm text-slate-600">
            建立完運動卡後，開場活動認識新朋友吧
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <GoogleLoginButton loginGoogle={loginGoogle} />
          <AppleLoginButton loginApple={loginApple} />
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="font-semibold text-blue-600 transition hover:text-blue-700"
          >
            改用 Email 登入
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={containerClass}>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">歡迎加入 SportsMatch</h1>
        <p className="mt-2 text-sm text-slate-600">
          探索在地活動、認識新夥伴，
          <br />
          一起組成你的運動夥伴圈。
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <InputField
          label="Email（電子郵件）"
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
          label="密碼"
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

        <Button type="submit" className="w-full rounded-2xl text-base" disabled={isLoading}>
          {isLoading ? '登入中…' : '用 Email 繼續'}
        </Button>

        <div className="text-center text-sm">
          <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-700">
            忘記密碼？
          </Link>
        </div>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-slate-200" />
        <span className="px-3 text-xs uppercase tracking-wide text-slate-400">或</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      <div className="flex flex-col gap-3">
        <GoogleLoginButton loginGoogle={loginGoogle} />
        <AppleLoginButton loginApple={loginApple} />
      </div>

      <div className="mt-6 text-center text-sm">
        <button
          type="button"
          onClick={() => window.alert('Need help? Email support@sportsmatch.com.')}
          className="font-semibold text-blue-600 transition hover:text-blue-700"
        >
          需要協助？
        </button>
      </div>
    </section>
  )
}
