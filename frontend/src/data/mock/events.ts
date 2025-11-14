export const EVENT_CARDS = {
  brisbane_basketball: {
    title: 'Basketball Pickup',
    location: 'South Bank Court',
    time: 'Sat, July 20 · 3:00-5:00 PM',
    description:
      'Casual half-court run focused on keeping things upbeat. Perfect if you are getting back into the game and want to meet locals.',
    tags: ['Beginner-friendly', 'Casual vibe', 'Just for fun'],
  },
  brisbane_badminton: {
    title: 'Badminton Under The Lights',
    location: 'Yeronga Community Centre',
    time: 'Fri, July 26 · 7:00-9:00 PM',
    description:
      'Doubles rotations and friendly drills. BYO racquet if you can, limited loaners available.',
    tags: ['All skill levels', 'Indoor courts', 'Social play'],
  },
  brisbane_pickleball: {
    title: 'Riverwalk Pickleball Rally',
    location: 'New Farm Pickleball Courts',
    time: 'Thu, July 25 · 5:30-7:00 PM',
    description:
      'Fast-paced kitchen battles with rotating partners. Great for players who enjoy quick points and big laughs.',
    tags: ['Great for newcomers', 'Paddle demos', 'Post-game snacks'],
  },
  brisbane_climbing: {
    title: 'Sunset Climbing Crew',
    location: 'Kangaroo Point Cliffs',
    time: 'Wed, July 24 · 4:30-6:30 PM',
    description:
      'Rope climbs and bouldering circuits with belay checks. Split between intermediate and advanced lines.',
    tags: ['Belay check', 'Gear share', 'Outdoor'],
  },
  brisbane_running: {
    title: 'Sunrise Run Club',
    location: 'New Farm Park Loop',
    time: 'Tue, July 23 · 6:00-7:15 AM',
    description:
      'Tempo run with optional coffee cool-down. Split into two pace groups (5:00/km and 6:00/km). Newcomers welcome.',
    tags: ['Coffee after', 'Pace groups', 'Community vibe'],
  },
  brisbane_hiking: {
    title: 'Mount Coot-tha Hike',
    location: 'JC Slaughter Falls Trailhead',
    time: 'Sun, July 28 · 7:30-10:30 AM',
    description:
      'Early-morning hike to catch the city views before the heat. Bring water and a light snack.',
    tags: ['Scenic lookout', 'Moderate pace', 'Trail buddies'],
  },
} as const

export const SPORT_LABELS = {
  basketball: 'Basketball',
  badminton: 'Badminton',
  pickleball: 'Pickleball',
  climbing: 'Climbing',
  running: 'Running',
  hiking: 'Hiking',
} as const

export const SKILL_LEVEL_LABELS = {
  mixed: 'All levels',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const
