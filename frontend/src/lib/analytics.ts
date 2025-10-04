export type AnalyticsEventName =
  | 'FilterSelect'
  | 'SessionView'
  | 'JoinClick'
  | 'SaveClick'
  | 'MapClick'
  | 'CreateIntent'

export type AnalyticsEventPayload = Record<string, unknown>

export function trackEvent(event: AnalyticsEventName, payload: AnalyticsEventPayload = {}) {
  console.debug('[analytics]', event, payload)
}
