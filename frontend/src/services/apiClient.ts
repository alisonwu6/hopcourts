import { AUTH_TOKEN_STORAGE_KEY } from '@/constants/storage'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

const buildUrl = (path: string, params?: RequestOptions['params']) => {
  const url = new URL(path.replace(/^\//, ''), `${API_BASE_URL.replace(/\/$/, '')}/`)
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      searchParams.append(key, String(value))
    })
    if ([...searchParams].length) {
      url.search = searchParams.toString()
    }
  }
  return url.toString()
}

export async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, auth = true, headers = {} } = options

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (auth) {
    const token =
      typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let details: any
    try {
      details = await response.json()
    } catch {
      details = { message: response.statusText }
    }
    const error = new Error(details?.message || 'Request failed')
    ;(error as any).details = details
    ;(error as any).status = response.status
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
