try {
  const globals = ['fetch', 'Headers', 'Request', 'Response', 'FormData', 'File', 'Blob']
  const missing = globals.some((key) => typeof globalThis[key] !== 'function')
  if (missing) {
    const { fetch, Headers, Request, Response, FormData, File, Blob } = require('node:undici')
    Object.assign(globalThis, { fetch, Headers, Request, Response, FormData, File, Blob })
    console.log('[polyfill] Fetch API provided via node:undici')
  }
} catch (err) {
  console.warn('[polyfill] Unable to install Fetch API polyfill:', err.message)
}
