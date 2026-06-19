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

// Returns a URL that, when navigated to, asks the in-app browser to hand the
// page off to the system browser. Null for cases the platform blocks
// (iOS Meta apps, and LINE — its line:// scheme is unreliable on newer versions).
export function getExternalBrowserDeepLink(url: string, userAgent?: string): string | null {
  const ua = getUserAgent(userAgent)
  const name = detectInAppBrowserName(ua)
  if (!name) return null

  // Android in-app WebViews can be escaped via Chrome intent URLs
  if (/Android/i.test(ua)) {
    const stripped = url.replace(/^https?:\/\//, '')
    return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`
  }

  return null
}
