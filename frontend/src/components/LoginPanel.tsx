import clsx from 'clsx'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import AppleLoginButton from '@/components/button/AppleLoginButton'
import { signInWithGoogle, signInWithApple } from '@/services/authService'

type Props = {
  className?: string
  variant?: 'card' | 'sheet'
}

export function LoginPanel({ className, variant = 'card' }: Props) {
  const containerClass = clsx(
    'rounded-[32px] border border-slate-100 bg-white shadow-[0_25px_70px_rgba(15,41,77,0.08)] px-6 py-8 sm:px-8',
    variant === 'sheet' && 'border-none shadow-none px-0',
    className
  )

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

  return (
    <section className={containerClass}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">歡迎加入 SportsMatch</h1>
        <p className="mt-2 text-sm text-slate-600">
          探索在地運動活動、認識新夥伴，
          <br />
          輕鬆開始你的運動生活。
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-4 w-full max-w-[320px] mx-auto">
        <GoogleLoginButton loginGoogle={loginGoogle} />
        <AppleLoginButton loginApple={loginApple} />
      </div>
    </section>
  )
}
