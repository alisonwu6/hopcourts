export type ApiResponse<T> = {
  ok: boolean
  data: T
}

export type Page = {
  limit: number
  offset: number
  has_more: boolean
}

export type Sport = {
  key: string
  label: string
  category?: string
  icon?: string
  sort?: number
  is_active?: boolean
}

export type Country = {
  key: string
  label: string
  sort?: number
  is_active?: boolean
}

export type City = {
  key: string
  country_key: string
  label: string
  sort?: number
  is_active?: boolean
}

export type Vibe = {
  key: string
  label: string
  subtitle?: string
  sort?: number
  is_active?: boolean
}

export type AgeRange = {
  key: string
  label: string
  sort?: number
  is_active?: boolean
}

export type Session = {
  id: string
  sport_key: string
  title?: string
  starts_at: string
  ends_at?: string
  place_name: string
  address?: string
  lat?: number
  lng?: number
  min_people?: number
  max_people?: number | null
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  visibility: 'public' | 'unlisted'
}

export type SessionMeta = {
  participant_count: number
  spots_left: number | null
  viewer_has_joined?: boolean
  viewer_has_checked_in?: boolean
}
