export type Vibe =
  | 'Chill'
  | 'Social'
  | 'Competitive'
  | 'Flow'
  | 'Growth'
  | 'Explorer'
  | 'Supportive'

export const vibeTokens: Record<Vibe, { bg: string; text: string; ring: string; card: string }> = {
  Chill: {
    bg: 'linear-gradient(135deg, #5FA8FF 0%, #1E72F1 100%)',
    text: '#FFFFFF',
    ring: '#1E72F1',
    card: 'linear-gradient(145deg, rgba(31,118,238,0.16) 0%, rgba(31,118,238,0.07) 100%)',
  },
  Social: {
    bg: 'linear-gradient(135deg, #FF6EA7 0%, #D946EF 100%)',
    text: '#FFFFFF',
    ring: '#D946EF',
    card: 'linear-gradient(145deg, rgba(247,165,0,0.16) 0%, rgba(247,165,0,0.07) 100%)',
  },
  Competitive: {
    bg: 'linear-gradient(135deg, #d96273 0%, #DB1F3A 100%)',
    text: '#FFFFFF',
    ring: '#DB1F3A',
    card: 'linear-gradient(145deg, rgba(219,31,58,0.16) 0%, rgba(219,31,58,0.07) 100%)',
  },
  Flow: {
    bg: 'linear-gradient(135deg, #C07CFF 0%, #7B3AF8 100%)',
    text: '#FFFFFF',
    ring: '#7B3AF8',
    card: 'linear-gradient(145deg, rgba(123,58,248,0.16) 0%, rgba(123,58,248,0.07) 100%)',
  },
  Growth: {
    bg: 'linear-gradient(135deg, #74A12E 0%, #49661d 100%)',
    text: '#FFFFFF',
    ring: '#49661d',
    card: 'linear-gradient(145deg, rgba(47,191,113,0.16) 0%, rgba(47,191,113,0.07) 100%)',
  },
  Explorer: {
    bg: 'linear-gradient(135deg, #873e23 0%, #4A3728 100%)',
    text: '#FFFFFF',
    ring: '#4A3728',
    card: 'linear-gradient(145deg, rgba(26,155,215,0.16) 0%, rgba(26,155,215,0.07) 100%)',
  },
  Supportive: {
    bg: 'linear-gradient(135deg, #FFCC33 0%, #ffb433 100%)',
    text: '#FFFFFF',
    ring: '#ffb433',
    card: 'linear-gradient(145deg, rgba(255,179,71,0.16) 0%, rgba(255,179,71,0.07) 100%)',
  },
}

