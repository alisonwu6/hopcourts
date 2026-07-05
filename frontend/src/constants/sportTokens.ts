const SPORT_COLORS: Record<string, string> = {
  BASKETBALL:    'bg-orange-100 text-orange-700',
  TENNIS:        'bg-emerald-100 text-emerald-700',
  BADMINTON:     'bg-yellow-100 text-yellow-700',
  VOLLEYBALL:    'bg-blue-100 text-blue-700',
  RUNNING:       'bg-rose-100 text-rose-700',
  CYCLING:       'bg-cyan-100 text-cyan-700',
  YOGA:          'bg-purple-100 text-purple-700',
  PILATES:       'bg-pink-100 text-pink-700',
  GYM:           'bg-slate-200 text-slate-700',
  SWIMMING:      'bg-sky-100 text-sky-700',
  HIKING:        'bg-lime-100 text-lime-700',
  TABLE_TENNIS:  'bg-amber-100 text-amber-700',
  BOULDERING:    'bg-stone-200 text-stone-700',
  PICKLEBALL:    'bg-teal-100 text-teal-700',
  FRISBEE:       'bg-indigo-100 text-indigo-700',
  SKATEBOARDING: 'bg-zinc-200 text-zinc-700',
}

const SPORT_LABELS: Record<string, string> = {
  BASKETBALL:    'Basketball',
  TENNIS:        'Tennis',
  BADMINTON:     'Badminton',
  VOLLEYBALL:    'Volleyball',
  RUNNING:       'Running',
  CYCLING:       'Cycling',
  YOGA:          'Yoga',
  PILATES:       'Pilates',
  GYM:           'Gym',
  SWIMMING:      'Swimming',
  HIKING:        'Hiking',
  TABLE_TENNIS:  'Table Tennis',
  BOULDERING:    'Bouldering',
  PICKLEBALL:    'Pickleball',
  FRISBEE:       'Frisbee',
  SKATEBOARDING: 'Skating',
}

export const getSportColor = (key: string) =>
  SPORT_COLORS[key.toUpperCase()] ?? 'bg-slate-100 text-slate-600'

export const getSportLabel = (key: string) =>
  SPORT_LABELS[key.toUpperCase()] ?? key

// Event tag classes — shared by EventCard and EventDetailView
export const EVENT_SPORT_CLASS = 'bg-ocean-100 text-ocean-700 border border-ocean-200'
export const GENDER_CLASS = 'bg-courts-100 text-courts-700 border border-courts-200'

export const getSkillClass = (level: string | undefined) => {
  switch (level?.toLowerCase()) {
    case 'beginner':     return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    case 'intermediate': return 'bg-orange-100 text-orange-700 border border-orange-200'
    case 'advanced':     return 'bg-red-100 text-red-700 border border-red-200'
    default:             return 'bg-slate-100 text-slate-600 border border-slate-200'
  }
}
