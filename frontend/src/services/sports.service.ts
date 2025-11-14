import { apiRequest } from './apiClient'

export type SportOption = {
  id: string
  name: string
  icon?: string
}

export async function fetchSports(): Promise<SportOption[]> {
  const response = await apiRequest<{ data: SportOption[] }>('GET', '/sports', { auth: false })
  return response.data ?? []
}
