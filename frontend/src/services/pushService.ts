import { httpGet, httpPost } from '@/api/http'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  return navigator.serviceWorker.register('/sw.js')
}

async function getVapidPublicKey(): Promise<string> {
  const res = await httpGet<{ publicKey: string }>('/push/vapid-public-key')
  return (res as any).publicKey
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.ready
  const publicKey = await getVapidPublicKey()

  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing

  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })
}

export async function savePushSubscription(subscription: PushSubscription) {
  await httpPost('/push/subscribe', { body: subscription.toJSON() })
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function isRunningAsPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}
