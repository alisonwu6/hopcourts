import { useMemo, useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { AlertDialog } from './AlertDialog'
import GoogleLoginButton from './button/GoogleLoginButton'
import { signInWithGoogle } from '@/services/authService'
import { detectInAppBrowserName, getExternalBrowserDeepLink, isInAppBrowser } from '@/lib/browser'

type LoginPromptSheetProps = {
  open: boolean
  onClose: () => void
  returnTo?: string
  onJoinAsGuest?: () => void
}

const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect'

export function LoginPromptSheet({ open, onClose, returnTo, onJoinAsGuest }: LoginPromptSheetProps) {
  const [showInAppDialog, setShowInAppDialog] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<{
    open: boolean
    title: string
    description: string
    type: 'success' | 'warning'
  }>({ open: false, title: '', description: '', type: 'success' })

  const inApp = useMemo(() => isInAppBrowser(), [])
  const inAppName = useMemo(() => detectInAppBrowserName(), [])
  const deepLink = useMemo(
    () => (typeof window !== 'undefined' ? getExternalBrowserDeepLink(window.location.href) : null),
    []
  )

  const loginGoogle = async () => {
    const path = returnTo ?? `${window.location.pathname}${window.location.search}${window.location.hash}`
    const isLocalPath = path.startsWith('/')

    // Belt-and-braces: sessionStorage for same-tab flows, OAuth URL query for
    // cross-app redirects where sessionStorage gets wiped (PWA, in-app browsers).
    if (isLocalPath) {
      try {
        sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path)
      } catch {
        console.warn('Failed to persist post-login redirect path')
      }
    }

    if (inApp) {
      setShowInAppDialog(true)
      onClose()
      return
    }
    const { data, error } = await signInWithGoogle(isLocalPath ? path : undefined)
    if (error) {
      alert(error.message)
      return
    }
    if (data?.url) window.location.href = data.url
  }

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        showHandle={false}
        sheetClassName="rounded-t-[32px] bg-white shadow-[0_-30px_60px_rgba(15,41,77,0.18)]"
        disableContainer
      >
        <div className="relative flex items-center justify-end px-5 pb-4 pt-5">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="px-5 pb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Welcome to HopCourts</h1>
            <p className="mt-2 text-sm text-slate-600">
              Ditch the chat chaos.
              <br />
              Just hop in and play.
            </p>
          </div>
          <div className="mx-auto mt-10 flex w-full max-w-[320px] flex-col gap-4">
            <GoogleLoginButton loginGoogle={loginGoogle} />
            {onJoinAsGuest && (
              <button
                onClick={() => {
                  onClose()
                  onJoinAsGuest()
                }}
                className="mt-1 text-sm text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
              >
                Join as guest instead
              </button>
            )}
          </div>
        </div>
      </BottomSheet>

      <AlertDialog
        open={showInAppDialog}
        onClose={() => setShowInAppDialog(false)}
        title="Open in your browser to sign in"
        description={
          <>
            You're in {inAppName || 'an in-app browser'}, where Google sign-in is blocked.
            <br />
            {deepLink
              ? 'Tap the button below to open this page in your browser.'
              : 'Open the menu (⋯ or the share icon) and choose "Open in browser", then sign in from there.'}
          </>
        }
        type="warning"
        actionLabel={deepLink ? 'Open in browser' : 'Copy link'}
        onAction={() => {
          if (deepLink) {
            window.location.href = deepLink
            return
          }
          navigator.clipboard
            .writeText(window.location.href)
            .then(() =>
              setCopyFeedback({
                open: true,
                title: 'Link copied',
                description: 'Paste it into Safari or Chrome to open.',
                type: 'success',
              })
            )
            .catch(() =>
              setCopyFeedback({
                open: true,
                title: 'Copy failed',
                description: `Please copy this link manually: ${window.location.href}`,
                type: 'warning',
              })
            )
        }}
        cancelLabel="Got it"
      />

      <AlertDialog
        open={copyFeedback.open}
        onClose={() => setCopyFeedback((prev) => ({ ...prev, open: false }))}
        title={copyFeedback.title}
        description={copyFeedback.description}
        type={copyFeedback.type}
      />
    </>
  )
}
