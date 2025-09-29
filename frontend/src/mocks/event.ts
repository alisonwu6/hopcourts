import { EventCardProps } from '@/interfaces/event'

export const mockEvents: EventCardProps[] = [
  {
    id: 'basketball-pickup',
    title: 'Basketball Pickup',
    location: 'South Bank Court',
    time: 'Sat, July 20 · 3:00–5:00 PM',
    joinedCount: 6,
    maxCount: 10,
    timeLeft: '2 hours',
    sport: 'Basketball',
    skillLevel: 'Beginner',
    description:
      'Casual half-court run focused on keeping things upbeat. Perfect if you are getting back into the game and want to meet locals.',
    host: {
      name: 'Blue',
      avatarUrl: '/avatars/blue.jpg',
      tag: 'Friendly & Chill',
    },
    tags: ['Beginner-friendly', 'Casual vibe', 'Just for fun'],
    participants: ['/avatars/a1.jpg', '/avatars/a2.jpg', '/avatars/a3.jpg'],
  },
  {
    id: 'volleyball-social',
    title: 'Volleyball Fun Match',
    location: 'Kangaroo Point',
    time: 'Sun, July 21 · 4:30–6:00 PM',
    joinedCount: 8,
    maxCount: 12,
    timeLeft: '5 hours',
    sport: 'Volleyball',
    skillLevel: 'Intermediate',
    description:
      'Friendly co-ed social game on the riverside sand courts. Expect warm ups, rotation practice, and drinks nearby afterward.',
    host: {
      name: 'Maggie',
      avatarUrl: '/avatars/maggie.jpg',
      tag: 'For all levels',
    },
    tags: ['Open to all', 'Friendly', 'Relaxed pace'],
    participants: [
      '/avatars/b1.jpg',
      '/avatars/b2.jpg',
      '/avatars/b3.jpg',
      '/avatars/b4.jpg',
    ],
  },
  {
    id: 'sunrise-run-club',
    title: 'Sunrise Run Club',
    location: 'New Farm Park Loop',
    time: 'Tue, July 23 · 6:00–7:15 AM',
    joinedCount: 12,
    maxCount: 20,
    timeLeft: '1 day',
    sport: 'Running',
    skillLevel: 'Intermediate',
    description:
      'Tempo run with optional coffee cool-down. Split into two pace groups (5:00/km and 6:00/km). Newcomers welcome.',
    host: {
      name: 'Eli',
      avatarUrl: '/avatars/eli.jpg',
      tag: 'Community Builder',
    },
    tags: ['Coffee after', 'Pace groups', 'Community vibe'],
    participants: [
      '/avatars/c1.jpg',
      '/avatars/c2.jpg',
      '/avatars/c3.jpg',
      '/avatars/c4.jpg',
    ],
  },
]
