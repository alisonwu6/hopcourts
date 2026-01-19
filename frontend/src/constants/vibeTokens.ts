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
  Growth: {
    bg: 'linear-gradient(135deg, #7CE3A1 0%, #2FBF71 100%)',
    text: '#0B3B2A',
    ring: '#2FBF71',
    card: 'linear-gradient(145deg, rgba(47,191,113,0.16) 0%, rgba(47,191,113,0.07) 100%)',
  },
  Explorer: {
    bg: 'linear-gradient(135deg, #6FD6FF 0%, #1A9BD7 100%)',
    text: '#05324D',
    ring: '#1A9BD7',
    card: 'linear-gradient(145deg, rgba(26,155,215,0.16) 0%, rgba(26,155,215,0.07) 100%)',
  },
  Supportive: {
    bg: 'linear-gradient(135deg, #FFE082 0%, #FFB347 100%)',
    text: '#5A3600',
    ring: '#FFB347',
    card: 'linear-gradient(145deg, rgba(255,179,71,0.16) 0%, rgba(255,179,71,0.07) 100%)',
  },
}

export const vibeList: { id: Vibe; title: string; subtitle: string }[] = [
  { id: 'Chill', title: '健康與冥想', subtitle: '穩定節奏、身心對齊' },
  { id: 'Social', title: '社交與連結', subtitle: '喜歡夥伴、一起流汗' },
  { id: 'Flow', title: '習慣與穩定', subtitle: '每天一點，養成節奏' },
  { id: 'Explorer', title: '自由與探索', subtitle: '熱愛冒險、說走就走' },
  { id: 'Growth', title: '學習與成長', subtitle: '技術提升、專業進步' },
  { id: 'Competitive', title: '競爭與挑戰', subtitle: '追求極限、享受對決' },
  { id: 'Supportive', title: '歸屬與關懷', subtitle: '陪伴夥伴、不趕時間' },
]
