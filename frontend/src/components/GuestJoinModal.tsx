import { useEffect, useRef, useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { signInAnonymouslyAsGuest } from '@/services/authService'
import { useAuthStore } from '@/stores/auth.store'
import { sessionService } from '@/services/sessionService'

type GuestJoinModalProps = {
  open: boolean
  onClose: () => void
  onGuestReady: () => Promise<void> | void
  onSignInInstead?: () => void
}

const MAX_NAME_LEN = 40

function friendlyAuthError(err: any): string {
  const status = err?.status ?? err?.response?.status
  const code = err?.code ?? err?.response?.data?.code ?? ''
  const raw = (err?.message || '').toLowerCase()
  if (
    status === 429 ||
    code === 'over_request_rate_limit' ||
    raw.includes('rate limit') ||
    raw.includes('too many')
  ) {
    return "Whoa, slow down — too many guests this hour. Please wait a minute and try again, or sign in instead."
  }
  return err?.message || 'Could not start a guest session. Please try again.'
}

export function GuestJoinModal({ open, onClose, onGuestReady, onSignInInstead }: GuestJoinModalProps) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const setAuthData = useAuthStore((s) => s.setAuthData)

  useEffect(() => {
    if (open) {
      setName('')
      setError(null)
      const t = setTimeout(() => inputRef.current?.focus(), 200)
      return () => clearTimeout(t)
    }
  }, [open])

  const trimmed = name.trim()
  const canSubmit = trimmed.length >= 1 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const { data, error: signInError } = await signInAnonymouslyAsGuest(trimmed)
      if (signInError) throw signInError
      const accessToken = data?.session?.access_token
      if (!accessToken) throw new Error('Sign-in succeeded but no session was returned.')
      const context = await sessionService.bootstrap(accessToken)
      setAuthData({ ...context.user, is_anonymous: true }, context.token, { remember: true })
      await onGuestReady()
      onClose()
    } catch (err: any) {
      setError(friendlyAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={submitting ? () => {} : onClose}
      showHandle={false}
      sheetClassName="rounded-t-[32px] bg-white shadow-[0_-30px_60px_rgba(15,41,77,0.18)]"
      disableContainer
    >
      <div className="relative flex items-center justify-end px-5 pb-2 pt-5">
        <button
          onClick={onClose}
          disabled={submitting}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-5 pb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Join as guest</h1>
          <p className="mt-2 text-sm text-slate-600">
            Just tell us what to call you on the court.
            <br />
            You can upgrade to a full account anytime.
          </p>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[320px] flex-col gap-3">
          <label className="text-xs font-medium text-slate-500" htmlFor="guest-name">
            Your name
          </label>
          <input
            id="guest-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSubmit) handleSubmit()
            }}
            placeholder="Tell us your name"
            maxLength={MAX_NAME_LEN}
            disabled={submitting}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none disabled:bg-slate-50"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-2 flex h-12 items-center justify-center rounded-full bg-emerald-700 px-6 text-base font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? 'Joining…' : 'Join as guest'}
          </button>

          {onSignInInstead && (
            <button
              onClick={() => {
                onClose()
                onSignInInstead()
              }}
              disabled={submitting}
              className="mt-1 text-sm text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
            >
              Sign in instead
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
