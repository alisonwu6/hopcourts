export type AnalyticsEventName =
  | 'FilterSelect'
  | 'GameView'
  | 'JoinClick'
  | 'SaveClick'
  | 'MapClick'
  | 'CreateIntent'
  | 'AthleteCard.View'
  | 'AthleteCard.HighFive'
  | 'AthleteCard.Message'
  | 'AthleteCard.Invite'
  | 'AthleteCard.Share'
  | 'AthleteCard.Stats.Open'
  | 'AthleteCard.Activity.Open'

export type AnalyticsEventPayload = Record<string, unknown>

export function trackEvent(event: AnalyticsEventName, payload: AnalyticsEventPayload = {}) {
  console.debug('[analytics]', event, payload)
}
