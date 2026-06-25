import { useState, useEffect, useRef, useCallback } from 'react'
import { BellRing, X, Share, SquarePlus, MoreHorizontal } from 'lucide-react'
import { isPushSupported, isRunningAsPWA, subscribeToPush, savePushSubscription } from '@/services/pushService'
import { useAuthStore } from '@/hooks'
import { isIOS, isMobile } from '@/lib/browser'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PushNotificationBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'hidden'>(() => {
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') return 'granted'
      if (Notification.permission === 'denied') return 'denied'
    }
    return 'idle'
  })
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem('push-banner-dismissed'))
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstallAndroid, setCanInstallAndroid] = useState(false)
  const isInstallingRef = useRef(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      installPromptRef.current = e as BeforeInstallPromptEvent
      setCanInstallAndroid(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleAndroidInstall = useCallback(async () => {
    if (!installPromptRef.current || isInstallingRef.current) return
    isInstallingRef.current = true
    try {
      await installPromptRef.current.prompt()
      const { outcome } = await installPromptRef.current.userChoice
      if (outcome === 'accepted') handleDismiss()
    } catch {
      // prompt() rejected — event already used or browser blocked it
    } finally {
      installPromptRef.current = null
      setCanInstallAndroid(false)
      isInstallingRef.current = false
    }
  }, [])

  const handleEnable = async () => {
    setPushStatus('loading')
    try {
      const sub = await subscribeToPush()
      if (!sub) { setPushStatus('hidden'); return }
      await savePushSubscription(sub)
      setPushStatus('granted')
    } catch {
      setPushStatus('hidden')
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('push-banner-dismissed', '1')
    setDismissed(true)
  }

  if (dismissed || !isMobile()) return null

  // Not yet installed as PWA — show install instructions
  if (!isRunningAsPWA()) {
    return (
      <div className="mx-4 mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-100 p-4">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-slate-900" />
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">No App Store required</p>
          {canInstallAndroid ? (
            <div className="mt-0.5 text-xs text-slate-500">
              Get full app features instantly:
              <button
                type="button"
                onClick={handleAndroidInstall}
                className="mt-3 flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white"
              >
                <SquarePlus className="h-3.5 w-3.5" />
                Add to Home Screen
              </button>
            </div>
          ) : isIOS() ? (
            <div className="mt-0.5 text-xs text-slate-500">
              Get full app features instantly:
              <ul className="mt-1 list-disc space-y-1 marker:text-slate-400">
                <li>
                  Tap <Share className="mx-1 inline-block h-3 w-3" /><strong>Share</strong> in your browser
                </li>
                <li>
                  Select <SquarePlus className="mx-1 inline-block h-3 w-3" /><strong>Add to Home Screen</strong> to get instant notifications on your phone.
                </li>
              </ul>
            </div>
          ) : (
            <p className="mt-0.5 text-xs text-slate-500">
              Tap <MoreHorizontal className="mx-0.5 inline-block h-3 w-3" /> in your browser and select <strong>Add to Home Screen</strong>.
            </p>
          )}
        </div>
        <button type="button" onClick={handleDismiss} className="text-slate-400">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // Running as PWA — show push notification prompt
  if (!isAuthenticated || !isPushSupported() || pushStatus === 'granted' || pushStatus === 'denied' || pushStatus === 'hidden') {
    return null
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
          disabled={pushStatus === 'loading'}
          className="mt-3 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {pushStatus === 'loading' ? 'Enabling…' : 'Enable notifications'}
        </button>
      </div>
      <button type="button" onClick={handleDismiss} className="text-slate-400">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
