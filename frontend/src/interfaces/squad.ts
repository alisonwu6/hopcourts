export interface SquadMemberThumb {
  id: string
  name: string
  avatarUrl: string
}

export interface SquadCoreSummary {
  id: string
  name: string
  energy: number
  city: string
  memberCount: number
  sessionCount: number
  toneLine: string
  heroImageUrl?: string
  members: SquadMemberThumb[]
}

export interface SquadCasualSummary {
  id: string
  name: string
  statusLabel: string
  heroImageUrl?: string
}

export interface SquadArchivedSummary {
  id: string
  name: string
  season: string
  linkLabel?: string
}

export interface SquadPageData {
  living: SquadCoreSummary
  coreSquads: SquadCoreSummary[]
  casualSquads: SquadCasualSummary[]
  archivedSquads: SquadArchivedSummary[]
}
