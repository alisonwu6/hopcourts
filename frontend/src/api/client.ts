import { httpGet, httpPost, httpDelete, httpPut, httpPatch } from './http'
import type { ApiResponse, Sport, Country, City, Vibe, AgeRange, Session, SessionMeta, Page } from './types'

export const api = {
  sports: {
    list: (lang: 'zh' | 'en' = 'en') =>
      httpGet<ApiResponse<{ items: Sport[] }>>('/sports', {
        auth: false,
        params: { lang },
      }),
  },
  dictionaries: {
    meta: () =>
      httpGet<
        ApiResponse<{
          sports?: any
          vibes?: any
          countries?: any
          age_ranges?: any
          cities?: any
        }>
      >('/meta/dictionaries', { auth: false }),
    sports: (lang: 'zh' | 'en' = 'en') =>
      httpGet<ApiResponse<{ items: any[] }>>('/sports', {
        auth: false,
        params: { lang },
      }),
    countries: (lang: 'zh' | 'en' = 'en') =>
      httpGet<ApiResponse<{ items: Country[] }>>('/countries', {
        auth: false,
        params: { lang },
      }),
    cities: (country?: string, lang: 'zh' | 'en' = 'en') =>
      httpGet<ApiResponse<{ items: City[] }>>('/cities', {
        auth: false,
        params: { country, lang },
      }),
    vibes: (lang: 'zh' | 'en' = 'en') =>
      httpGet<ApiResponse<{ items: Vibe[] }>>('/vibes', {
        auth: false,
        params: { lang },
      }),
    ageRanges: (lang: 'zh' | 'en' = 'en') =>
      httpGet<ApiResponse<{ items: AgeRange[] }>>('/age-ranges', {
        auth: false,
        params: { lang },
      }),
  },
  sessions: {
    list: (params: Record<string, any> = {}) =>
      httpGet<ApiResponse<{ items: Session[]; page: Page }>>('/sessions', {
        auth: false,
        params,
      }),
    detail: (id: string) =>
      httpGet<ApiResponse<{ session: Session; meta: SessionMeta }>>(`/sessions/${id}`, {
        auth: false,
      }),
    create: (body: any) => httpPost<ApiResponse<{ session: Session }>>('/sessions', { body }),
    join: (id: string) => httpPost<ApiResponse<any>>(`/sessions/${id}/join`, {}),
    leave: (id: string) => httpDelete<ApiResponse<any>>(`/sessions/${id}/join`, {}),
    checkIn: (id: string, body: { lat: number; lng: number }) =>
      httpPost<ApiResponse<any>>(`/sessions/${id}/check-in`, { body }),
  },
  me: {
    profile: {
      get: () => httpGet<ApiResponse<any>>('/me/profile'),
      update: (body: any) => httpPatch<ApiResponse<any>>('/me/profile', { body }),
    },
    preferences: {
      get: () => httpGet<ApiResponse<any>>('/me/preferences'),
      update: (body: any) => httpPatch<ApiResponse<any>>('/me/preferences', { body }),
    },
    stats: () => httpGet<ApiResponse<any>>('/me/stats'),
    deleteAccount: () => httpDelete<ApiResponse<any>>('/me/account'),
  },
  profiles: {
    getByUsername: (username: string) =>
      httpGet<ApiResponse<any>>(`/profiles/${encodeURIComponent(username)}`, { auth: false }),
    listSessionsByUsername: (
      username: string,
      params: {
        role?: 'all' | 'hosted' | 'joined'
        time?: 'upcoming' | 'history'
        limit?: number
        offset?: number
      } = {}
    ) =>
      httpGet<ApiResponse<any>>(`/profiles/${encodeURIComponent(username)}/sessions`, {
        auth: false,
        params,
      }),
    getTeammates: () => httpGet<ApiResponse<any[]>>('/me/teammates'),
  },
}
