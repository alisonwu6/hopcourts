// Module-level cache — survives component unmount/remount cycles (tab switches).
// Data is stored for TTL_MS; stale entries are evicted on next read.

const store = new Map<string, { data: unknown; at: number }>()
const TTL_MS = 5 * 60 * 1000 // 5 minutes

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() - entry.at > TTL_MS) {
    store.delete(key)
    return null
  }
  return entry.data as T
}

export function cacheSet(key: string, data: unknown): void {
  store.set(key, { data, at: Date.now() })
}

export function cacheInvalidate(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}
