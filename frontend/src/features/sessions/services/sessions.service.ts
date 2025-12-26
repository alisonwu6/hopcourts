import { apiRequest } from '@/api/http'
import type { ApiResponse } from '@/api/types'

export const sessionsService = {
  // TODO: wire to real endpoints (/v1/sessions etc.)
  async list(params: Record<string, any> = {}) {
    return apiRequest<ApiResponse<any>>('GET', '/v1/sessions', {
      auth: false,
      params,
    })
  },
}
