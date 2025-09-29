import { EventCardProps } from '@/interfaces/event'

export const mockEvents: EventCardProps[] = [
  {
    id: 'basketball-pickup',
    contentKey: 'basketball',
    sport: 'basketball',
    skillLevel: 'beginner',
    joinedCount: 6,
    maxCount: 10,
    timeLeft: '2 hours',
    host: {
      name: 'Blue',
      avatarUrl: '/avatars/blue.jpg',
      tag: 'Friendly & Chill',
    },
    participants: ['/avatars/a1.jpg', '/avatars/a2.jpg', '/avatars/a3.jpg'],
  },
  {
    id: 'volleyball-social',
    contentKey: 'volleyball',
    sport: 'volleyball',
    skillLevel: 'intermediate',
    joinedCount: 8,
    maxCount: 12,
    timeLeft: '5 hours',
    host: {
      name: 'Maggie',
      avatarUrl: '/avatars/maggie.jpg',
      tag: 'For all levels',
    },
    participants: [
      '/avatars/b1.jpg',
      '/avatars/b2.jpg',
      '/avatars/b3.jpg',
      '/avatars/b4.jpg',
    ],
  },
  {
    id: 'sunrise-run-club',
    contentKey: 'running',
    sport: 'running',
    skillLevel: 'intermediate',
    joinedCount: 12,
    maxCount: 20,
    timeLeft: '1 day',
    host: {
      name: 'Eli',
      avatarUrl: '/avatars/eli.jpg',
      tag: 'Community Builder',
    },
    participants: [
      '/avatars/c1.jpg',
      '/avatars/c2.jpg',
      '/avatars/c3.jpg',
      '/avatars/c4.jpg',
    ],
  },
]
