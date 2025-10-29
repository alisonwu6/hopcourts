export function formatSpotsAvailable(count: number): string {
  return `+${count} spots available`
}

export function formatRosterCount(joined: number, max: number): string {
  return `${joined}/${max} rostered`
}

export function formatJoinCounts(joined: number, max: number): string {
  return `${joined} / ${max} spots filled`
}

export function formatStartsIn(timeLeft: string): string {
  return `Starts in ${timeLeft}`
}

export function formatHostedBy(name: string): string {
  return `Hosted by ${name}`
}
