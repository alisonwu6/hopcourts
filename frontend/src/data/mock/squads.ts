import type { SquadPageData } from '@/interfaces/squad'

export const mockSquadPageData: SquadPageData = {
  living: {
    id: 'core_river',
    name: 'The River Crew',
    energy: 78,
    city: 'Brisbane',
    memberCount: 5,
    sessionCount: 12,
    toneLine: 'Flowing strong this week.',
    heroImageUrl: '/mock/squads/river_bg.jpg',
    members: [
      { id: 'member_01', name: 'Tere', avatarUrl: '/mock/athletes/tere_avatar.jpg' },
      { id: 'member_02', name: 'Liam', avatarUrl: '/mock/athletes/liam_avatar.jpg' },
      { id: 'member_03', name: 'Keira', avatarUrl: '/mock/athletes/keira_avatar.jpg' },
      { id: 'member_04', name: 'Moss', avatarUrl: '/mock/athletes/moss_avatar.jpg' },
      { id: 'member_05', name: 'Blue', avatarUrl: '/mock/athletes/blue_avatar.jpg' },
    ],
  },
  coreSquads: [
    {
      id: 'core_river',
      name: 'The River Crew',
      energy: 78,
      city: 'Brisbane',
      memberCount: 5,
      sessionCount: 12,
      toneLine: 'Tempo run locked for Thursday night.',
      heroImageUrl: '/mock/squads/river_bg.jpg',
      members: [
        { id: 'member_01', name: 'Tere', avatarUrl: '/mock/athletes/tere_avatar.jpg' },
        { id: 'member_06', name: 'Jo', avatarUrl: '/mock/athletes/jo_avatar.jpg' },
        { id: 'member_07', name: 'Eva', avatarUrl: '/mock/athletes/eva_avatar.jpg' },
        { id: 'member_08', name: 'Sam', avatarUrl: '/mock/athletes/sam_avatar.jpg' },
      ],
    },
    {
      id: 'core_dawn',
      name: 'Dawn Track Pack',
      energy: 64,
      city: 'Brisbane',
      memberCount: 8,
      sessionCount: 18,
      toneLine: 'Pacing drills added for Saturday.',
      heroImageUrl: '/mock/squads/dawn_bg.jpg',
      members: [
        { id: 'member_11', name: 'Mika', avatarUrl: '/mock/athletes/mika_avatar.jpg' },
        { id: 'member_12', name: 'Jon', avatarUrl: '/mock/athletes/jon_avatar.jpg' },
        { id: 'member_13', name: 'Lola', avatarUrl: '/mock/athletes/lola_avatar.jpg' },
      ],
    },
  ],
  casualSquads: [
    {
      id: 'casual_boulder',
      name: 'Boulder Buddies',
      statusLabel: 'Last climb · 18 days ago',
      heroImageUrl: '/mock/squads/boulder_bg.jpg',
    },
    {
      id: 'casual_climbing',
      name: 'Climbing Crew',
      statusLabel: 'Dormant · rally soon?',
      heroImageUrl: '/mock/squads/climbing_bg.jpg',
    },
    {
      id: 'casual_coffee',
      name: 'Coffee After Crew',
      statusLabel: 'Casual meetups · Sun mornings',
      heroImageUrl: '/mock/squads/coffee_bg.jpg',
    },
    {
      id: 'casual_beach',
      name: 'Beach Volley Nights',
      statusLabel: 'Roster forming · 4 spots left',
      heroImageUrl: '/mock/squads/beach_bg.jpg',
    },
  ],
  archivedSquads: [
    {
      id: 'archived_boxers',
      name: 'Bayside Boxers',
      season: '2024 Winter',
      linkLabel: 'View recap',
    },
    {
      id: 'archived_riders',
      name: 'Night Riders',
      season: '2023 Spring',
      linkLabel: 'See highlights',
    },
  ],
}
