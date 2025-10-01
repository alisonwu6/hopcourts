import { Link } from 'react-router-dom'
import logoUrl from '@/assets/main-logo.png'
import { Button } from '@/components/ui/button'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import AppleLoginButton from '@/components/button/AppleLoginButton'
import { useCopy } from '@/i18n/LanguageProvider'

export default function Splash() {
  const copy = useCopy()

  const loginGoogle = () => {
    console.log('loginGoogle')
  }

  const loginApple = () => {
    console.log('loginApple')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-100 via-amber-50 to-emerald-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(253,230,138,0.45),_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 py-10 sm:px-10">
        <main className="flex w-full flex-1 flex-col items-center justify-start gap-10 text-center">
          <div className="flex flex-col items-center gap-6">
            <img
              className="h-56 w-auto drop-shadow-lg sm:h-64"
              src={logoUrl}
              alt={copy.common.appName}
            />
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                {copy.splash.headline}
              </h1>
              <p className="mx-auto max-w-xl text-base text-slate-600">
                {copy.splash.subcopy}
              </p>
            </div>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <GoogleLoginButton loginGoogle={loginGoogle} />
            <AppleLoginButton loginApple={loginApple} />
          </div>
          <Button
            asChild
            variant="secondary"
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Link to="/home">{copy.splash.continueCta}</Link>
          </Button>
        </main>
      </div>
    </div>
  )
}
