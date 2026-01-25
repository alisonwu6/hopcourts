import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  auth?: boolean
  userIdOverride?: string
  tokenOverride?: string
  headers?: Record<string, string>
}

const API_PREFIX = '/api/v1'

const getBaseUrl = () => {
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
  return base.replace(/\/$/, '')
}

const buildUrl = (path: string, params?: RequestOptions['params']) => {
  const cleanedPath = path.replace(/^\//, '')
  const base = getBaseUrl()
  // If base is empty (relative path), use current origin to satisfy URL constructor
  const urlBase = base || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  
  const url = new URL(`${API_PREFIX.replace(/\/$/, '')}/${cleanedPath}`, urlBase)
  
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      searchParams.append(key, String(value))
    })
    const qs = searchParams.toString()
    if (qs) url.search = qs
  }

  // If we used a fallback origin but the config was meant to be relative, 
  // we could return url.pathname + url.search. 
  // But returning the full URL with current origin is also fine for fetch().
  return url.toString()
}

const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return (
    window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
    window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  )
}

const getStoredUserId = () => {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem('x-user-id') ?? window.localStorage.getItem('x-user-id')
}

export async function http<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, auth = true, userIdOverride, tokenOverride, headers = {} } = options

  const reqHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (auth) {
    const token = tokenOverride || getStoredToken()
    if (token) reqHeaders.Authorization = `Bearer ${token}`
  }

  const userId = userIdOverride || getStoredUserId()
  if (userId) {
    reqHeaders['x-user-id'] = userId
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  const parseError = async () => {
    try {
      return await response.json()
    } catch {
      return { message: response.statusText }
    }
  }

  if (!response.ok) {
    const details = await parseError()
    const err = new Error(details?.message || 'Request failed')
    ;(err as any).status = response.status
    ;(err as any).details = details
    throw err
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const httpGet = <T>(path: string, opts?: RequestOptions) => http<T>('GET', path, opts)
export const httpPost = <T>(path: string, opts?: RequestOptions) => http<T>('POST', path, opts)
export const httpPut = <T>(path: string, opts?: RequestOptions) => http<T>('PUT', path, opts)
export const httpPatch = <T>(path: string, opts?: RequestOptions) => http<T>('PATCH', path, opts)
export const httpDelete = <T>(path: string, opts?: RequestOptions) => http<T>('DELETE', path, opts)
