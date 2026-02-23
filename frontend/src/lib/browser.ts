const IN_APP_UA_PATTERNS = [
  /Instagram/i,
  /Threads/i,
]

export function isInAppBrowser(userAgent?: string): boolean {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (!ua) return false
  return IN_APP_UA_PATTERNS.some((pattern) => pattern.test(ua))
}

export function detectInAppBrowserName(userAgent?: string): string | null {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (!ua) return null
  if (/Threads/i.test(ua)) return 'Threads'
  if (/Instagram/i.test(ua)) return 'Instagram'
  return null
}
