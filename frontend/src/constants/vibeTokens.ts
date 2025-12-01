export type Vibe = 'Chill' | 'Social' | 'Competitive' | 'Flow'

export const vibeTokens: Record<
  Vibe,
  { bg: string; text: string; ring: string; card: string }
> = {
  Chill: {
    bg: 'linear-gradient(135deg, #5FA8FF 0%, #1E72F1 100%)',
    text: '#FFFFFF',
    ring: '#1E72F1',
    card: 'linear-gradient(145deg, rgba(31,118,238,0.16) 0%, rgba(31,118,238,0.07) 100%)',
  },
  Social: {
    bg: 'linear-gradient(135deg, #FFD55F 0%, #F7A500 100%)',
    text: '#FFFFFF',
    ring: '#F7A500',
    card: 'linear-gradient(145deg, rgba(247,165,0,0.16) 0%, rgba(247,165,0,0.07) 100%)',
  },
  Competitive: {
    bg: 'linear-gradient(135deg, #F87171 0%, #DB1F3A 100%)',
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
}

export const vibeList: { id: Vibe; title: string; subtitle: string }[] = [
  { id: 'Chill', title: 'Chill', subtitle: 'Easy pace, low pressure' },
  { id: 'Social', title: 'Social', subtitle: 'Here for banter & people' },
  { id: 'Competitive', title: 'Competitive', subtitle: 'Loves close games' },
  { id: 'Flow', title: 'Flow', subtitle: 'Headphones on, in your zone' },
]
