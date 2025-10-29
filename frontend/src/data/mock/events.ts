export const EVENT_CARDS = {
  brisbane_basketball: {
    title: 'Basketball Pickup',
    location: 'South Bank Court',
    time: 'Sat, July 20 · 3:00-5:00 PM',
    description:
      'Casual half-court run focused on keeping things upbeat. Perfect if you are getting back into the game and want to meet locals.',
    tags: ['Beginner-friendly', 'Casual vibe', 'Just for fun'],
  },
  brisbane_volleyball: {
    title: 'Volleyball Fun Match',
    location: 'Kangaroo Point',
    time: 'Sun, July 21 · 4:30-6:00 PM',
    description:
      'Friendly co-ed social game on the riverside sand courts. Expect warm ups, rotation practice, and drinks nearby afterward.',
    tags: ['Open to all', 'Friendly', 'Relaxed pace'],
  },
  brisbane_running: {
    title: 'Sunrise Run Club',
    location: 'New Farm Park Loop',
    time: 'Tue, July 23 · 6:00-7:15 AM',
    description:
      'Tempo run with optional coffee cool-down. Split into two pace groups (5:00/km and 6:00/km). Newcomers welcome.',
    tags: ['Coffee after', 'Pace groups', 'Community vibe'],
  },
} as const

export const SPORT_LABELS = {
  basketball: 'Basketball',
  volleyball: 'Volleyball',
  running: 'Running',
} as const

export const SKILL_LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const
