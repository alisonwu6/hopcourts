import logoUrl from '@/assets/main-logo.png'
import { Button } from '@/components/ui/button'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import AppleLoginButton from '@/components/button/AppleLoginButton'
import { colors } from '../lib/theme'

export default function Splash() {
  // const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN
  // const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID
  const REDIRECT_URI = `${window.location.origin}/auth/callback`

  const loginGoogle = () => {
    console.log('loginGoogle')
    // const url = new URL(`${COGNITO_DOMAIN}/oauth2/authorize`)
    // url.searchParams.set('client_id', CLIENT_ID)
    // url.searchParams.set('response_type', 'code')
    // url.searchParams.set('redirect_uri', REDIRECT_URI)
    // url.searchParams.set('identity_provider', 'Google')
    // url.searchParams.set('scope', 'openid profile email')
    // window.location.assign(url.toString())
  }

  const loginApple = () => {
    console.log('loginApple')
  }

  return (
    <div
      className="min-h-screen grid place-items-center p-8"
      style={{ background: colors.softGray }}
    >
      <div className="text-center space-y-6">
        <div className="flex items-center">
          <img
            className="h-80 w-auto"
            src={logoUrl}
            alt="SportsMatch logo"
            onError={(e) => {
              const t = e.target as HTMLImageElement
              t.style.display = 'none'
            }}
          />
        </div>
        <div className="text-slate-600 mb-2">Your journey starts here.</div>
        <div className="text-slate-600">Find your people. Keep the streak.</div>
        <div className="flex justify-center flex-col gap-4 mt-20">
          <GoogleLoginButton loginGoogle={loginGoogle} />
          <AppleLoginButton loginApple={loginApple} />
        </div>
      </div>
    </div>
  )
}
