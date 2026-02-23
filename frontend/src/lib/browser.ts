const IN_APP_UA_PATTERNS = [
  /FBAN/i,
  /FBAV/i,
  /Instagram/i,
  /Line/i,
  /Line\/\d+/i,
  /Threads/i,
  /MicroMessenger/i,
]

export function isInAppBrowser(userAgent?: string): boolean {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (!ua) return false
  return IN_APP_UA_PATTERNS.some((pattern) => pattern.test(ua))
}

export function detectInAppBrowserName(userAgent?: string): string | null {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (!ua) return null
  if (/Line/i.test(ua)) return 'LINE'
  if (/Threads/i.test(ua)) return 'Threads'
  if (/Instagram/i.test(ua)) return 'Instagram'
  if (/FBAN|FBAV/i.test(ua)) return 'Facebook'
  if (/MicroMessenger/i.test(ua)) return 'WeChat'
  return isInAppBrowser(ua) ? '內建瀏覽器' : null
}
