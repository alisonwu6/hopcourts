import clsx from 'clsx'
import { useMemo, useState } from 'react'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import { AlertDialog } from '@/components'
// import AppleLoginButton from '@/components/button/AppleLoginButton'
import { signInWithGoogle, signInWithApple } from '@/services/authService'
import { detectInAppBrowserName, isInAppBrowser } from '@/lib/browser'

type Props = {
  className?: string
  variant?: 'card' | 'sheet'
}

export function LoginPanel({ className, variant = 'card' }: Props) {
  const [showInAppDialog, setShowInAppDialog] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<{
    open: boolean
    title: string
    description: string
    type: 'success' | 'warning'
  }>({
    open: false,
    title: '',
    description: '',
    type: 'success',
  })
  const inApp = useMemo(() => isInAppBrowser(), [])
  const inAppName = useMemo(() => detectInAppBrowserName(), [])

  const containerClass = clsx(
    'rounded-[32px] border border-slate-100 bg-white shadow-[0_25px_70px_rgba(15,41,77,0.08)]',
    variant === 'sheet' && 'border-none shadow-none px-0',
    className
  )

  const loginGoogle = async () => {
    if (inApp) {
      setShowInAppDialog(true)
      return
    }
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
        <h1 className="text-2xl font-bold text-slate-900">Welcome to SportsMatch</h1>
        <p className="mt-2 text-sm text-slate-600">
          Explore local sports events, meet new friends,
          <br />
          and start your active lifestyle with ease.
        </p>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[320px] flex-col gap-4">
        <GoogleLoginButton loginGoogle={loginGoogle} />
        {/* <AppleLoginButton loginApple={loginApple} /> */}
      </div>

      <AlertDialog
        open={showInAppDialog}
        onClose={() => setShowInAppDialog(false)}
        title="請改用外部瀏覽器登入"
        description={
          <>
            你目前在{inAppName || 'App 內建瀏覽器'}中，Google 登入會被封鎖。
            <br />
            請點右上角「⋯」選單，接續選「使用外部瀏覽器開啟」，開啟後再進行登入。
          </>
        }
        type="warning"
        actionLabel="複製此頁連結"
        onAction={() => {
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => {
              setCopyFeedback({
                open: true,
                title: '已複製連結',
                description: '請貼到 Safari 或 Chrome 開啟。',
                type: 'success',
              })
            })
            .catch(() => {
              setCopyFeedback({
                open: true,
                title: '複製失敗',
                description: `請手動複製此連結：${window.location.href}`,
                type: 'warning',
              })
            })
        }}
        cancelLabel="知道了"
      />

      <AlertDialog
        open={copyFeedback.open}
        onClose={() => setCopyFeedback((prev) => ({ ...prev, open: false }))}
        title={copyFeedback.title}
        description={copyFeedback.description}
        type={copyFeedback.type}
      />
    </section>
  )
}
