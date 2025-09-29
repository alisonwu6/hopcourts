import { Link } from 'react-router-dom'
import logoUrl from '@/assets/main-logo.png'
import { Button } from '@/components/ui/button'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import AppleLoginButton from '@/components/button/AppleLoginButton'
import { useCopy } from '@/i18n/LanguageProvider'

export default function Splash() {
  const copy = useCopy()
  const REDIRECT_URI = `${window.location.origin}/auth/callback`

  const loginGoogle = () => {
    console.log('loginGoogle')
  }

  const loginApple = () => {
    console.log('loginApple')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-emerald-800 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              className="h-12 w-auto"
              src={logoUrl}
              alt={copy.common.appName}
            />
            <div>
              <div className="text-lg font-semibold">{copy.common.appName}</div>
              <div className="text-sm text-emerald-200">{copy.common.tagline}</div>
            </div>
          </div>
          <Button
            asChild
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <Link to="/home">{copy.splash.skip}</Link>
          </Button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              {copy.splash.headline}
            </h1>
            <p className="mx-auto max-w-xl text-base text-emerald-100">
              {copy.splash.subcopy}
            </p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <GoogleLoginButton loginGoogle={loginGoogle} />
            <AppleLoginButton loginApple={loginApple} />
            <div className="text-xs text-emerald-100">
              {copy.splash.legalNotice}
            </div>
          </div>
          <Button
            asChild
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20"
          >
            <Link to="/home">{copy.splash.continueCta}</Link>
          </Button>
        </main>
        <footer className="flex justify-between text-xs text-emerald-100">
          <span>{copy.splash.footerInvite}</span>
          <span>
            {copy.splash.redirectLabel}: {REDIRECT_URI}
          </span>
        </footer>
      </div>
    </div>
  )
}
