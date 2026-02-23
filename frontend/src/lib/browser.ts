// Expanded in‑app browser detection
const IN_APP_UA_PATTERNS: Array<[string, RegExp]> = [
  // Meta ecosystem
  ['Threads', /Threads/i],
  ['Instagram', /Instagram/i],
  ['Facebook', /FBAN|FBAV|FB_IAB/i],
  ['Messenger', /FBAN\/Messenger|FB_IAB\/MESSENGER/i],

  // LINE
  ['LINE', /Line\//i],

  // Generic iOS WebView (Safari-like but not full Safari)
  ['iOS WebView', /(iPhone|iPad|iPod).*AppleWebKit(?!.*Safari)/i],

  // Android WebView
  ['Android WebView', /; wv\)/i],
]

function getUserAgent(userAgent?: string): string {
  return userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || ''
}

export function isInAppBrowser(userAgent?: string): boolean {
  const ua = getUserAgent(userAgent)
  if (!ua) return false
  return IN_APP_UA_PATTERNS.some(([, pattern]) => pattern.test(ua))
}

export function detectInAppBrowserName(userAgent?: string): string | null {
  const ua = getUserAgent(userAgent)
  if (!ua) return null
  const hit = IN_APP_UA_PATTERNS.find(([, pattern]) => pattern.test(ua))
  return hit ? hit[0] : null
}
