import { useState, useEffect } from 'react'
import { BellRing, X, Share, SquarePlus } from 'lucide-react'
import { isPushSupported, isRunningAsPWA, subscribeToPush, savePushSubscription } from '@/services/pushService'
import { useAuthStore } from '@/hooks'

export function PushNotificationBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'hidden'>('idle')

  useEffect(() => {
    if (!isAuthenticated || !isPushSupported()) {
      setStatus('hidden')
      return
    }
    const permission = Notification.permission
    if (permission === 'granted') setStatus('granted')
    else if (permission === 'denied') setStatus('hidden')
    else if (localStorage.getItem('push-banner-dismissed')) setStatus('hidden')
  }, [isAuthenticated])

  const handleEnable = async () => {
    setStatus('loading')
    try {
      const sub = await subscribeToPush()
      if (!sub) {
        setStatus('hidden')
        return
      }
      await savePushSubscription(sub)
      setStatus('granted')
    } catch {
      setStatus('hidden')
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('push-banner-dismissed', '1')
    setStatus('hidden')
  }

  if (status === 'hidden' || status === 'granted') return null

  if (!isRunningAsPWA()) {
    return (
      <div className="mx-4 mb-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-100 p-4">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-slate-900" />
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">No App Store required</p>
          <div className="mt-0.5 text-xs text-slate-500">
            Get full app features instantly:
            <ul className="mt-1 list-disc space-y-1 marker:text-slate-400">
              <li>
                Tap
                <Share className="mx-1 inline-block h-3 w-3" />
                <strong>Share</strong> in your browser
              </li>
              <li>
                Select
                <SquarePlus className="mx-1 inline-block h-3 w-3" />
                <strong>Add to Home Screen</strong> to get instant notifications on your phone.
              </li>
            </ul>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-100 p-4">
      <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-slate-900" />
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">Never miss a court buzz</p>
        <p className="mt-0.5 text-xs text-slate-500">Stay updated to events you join.</p>
        <button
          type="button"
          onClick={handleEnable}
          disabled={status === 'loading'}
          className="mt-3 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {status === 'loading' ? 'Enabling…' : 'Enable notifications'}
        </button>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="text-slate-400"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
