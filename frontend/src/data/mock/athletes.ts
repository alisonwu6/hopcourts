import type { AthleteCardProps } from '@/interfaces/athlete'

export const mockAthletes: AthleteCardProps[] = [
  {
    id: 'athlete_01',
    name: 'Tere Wu',
    sport: 'Boxing',
    city: 'Brisbane',
    vibes: ['🔥 Competitive', '😄 Social'],
    avatarUrl: '/mock/athletes/tere_avatar.jpg',
    backgroundUrl: '/mock/athletes/tere_bg.jpg',
    activeNow: true,
    highFiveCount: 12,
  },
  {
    id: 'athlete_02',
    name: 'Liam Chen',
    sport: 'Climbing',
    city: 'Gold Coast',
    vibes: ['🧗 Focused', '🌿 Chill'],
    avatarUrl: '/mock/athletes/liam_avatar.jpg',
    backgroundUrl: '/mock/athletes/liam_bg.jpg',
    activeNow: false,
    highFiveCount: 5,
    lastActiveLabel: 'Last active · 3 days ago',
  },
  {
    id: 'athlete_03',
    name: 'Keira Moss',
    sport: 'Running',
    city: 'Brisbane',
    vibes: ['⚡ Tempo crew', '☕ Coffee after'],
    avatarUrl: '/mock/athletes/keira_avatar.jpg',
    backgroundUrl: '/mock/athletes/keira_bg.jpg',
    activeNow: false,
    highFiveCount: 9,
    lastActiveLabel: 'Active earlier today',
  },
]
