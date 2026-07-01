import { apiRequest } from './apiClient'

export type FeedbackType = 'issue' | 'feature' | 'account' | 'other'

export interface CreateFeedbackRequest {
  type: FeedbackType
  message: string
  page?: string
  allow_reply: boolean
  images?: string[]
  guest_email?: string
  meta?: Record<string, any>
}

export const feedbackService = {
  create: async (data: CreateFeedbackRequest) => {
    return apiRequest('POST', 'v1/feedback', { body: data })
  },
}
