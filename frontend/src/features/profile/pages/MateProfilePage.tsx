import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, Frown, List, CalendarDays, Share } from 'lucide-react'
import { type MateCardProps } from '@/features/mates/components/MateCard'
import { HeroCard } from '@/features/profile/components/HeroCard'
import { PageLoading } from '@/components/PageLoading'
import { EventsViewPanel } from '@/features/events/components/EventsViewPanel'
import { eventsService } from '@/features/events/services/eventsService'
import type { PlayerEvent } from '@/types'

import { api } from '@/api/client'
import type { ApiResponse } from '@/api/types'
import { useVibeUtils, useSports, useCities } from '@/features/dictionaries/hooks'

export function MateProfilePage() {
  const navigate = useNavigate()
  const { username } = useParams<{ username: string }>()
  const { state } = useLocation() as { state?: { mate?: Partial<MateCardProps>; from?: string } }
  const mate = state?.mate
  const { items: sportsDict } = useSports('en')
  const { vibeKeyToUnion, labelForVibe } = useVibeUtils('en')
  const { items: citiesDict } = useCities(undefined, 'en')

  const asStringArray = (items?: any[]) =>
    Array.isArray(items) ? items.map((i) => (typeof i === 'string' ? i : String(i?.label || i?.key || i))) : []

  const labelForSport = useMemo(() => {
    const keyMap = new Map<string, string>()
    const labelMap = new Map<string, string>()
    sportsDict.forEach((s) => {
      keyMap.set(s.key.toLowerCase(), s.label)
      labelMap.set(s.label.toLowerCase(), s.label)
    })
    return (value: string) => {
      if (!value) return value
      const lower = String(value).toLowerCase()
      return keyMap.get(lower) || labelMap.get(lower) || value
    }
  }, [sportsDict])

  const labelForCity = useMemo(() => {
    const keyMap = new Map<string, string>()
    const labelMap = new Map<string, string>()
    citiesDict.forEach((c) => {
      keyMap.set(c.key.toLowerCase(), c.label)
      labelMap.set(c.label.toLowerCase(), c.label)
    })
    return (value: string) => {
      if (!value) return value
      const lower = value.toLowerCase()
      return keyMap.get(lower) || labelMap.get(lower) || value
    }
  }, [citiesDict])

  const [profileData, setProfileData] = useState<MateCardProps | null>(null)
  const [loading, setLoading] = useState(!mate)
  const [error, setError] = useState<string | null>(null)
  const [hostedUpcomingEvents, setHostedUpcomingEvents] = useState<PlayerEvent[]>([])
  const [isHostedEventsLoading, setIsHostedEventsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar')

  useEffect(() => {
    const normalizeSports = (list: any[]) => {
      const favorites: string[] = []
      const trying: string[] = []
      list.forEach((item) => {
        const kind = (item?.kind || '').toUpperCase()
        const key = item?.sport_key || item?.sportKey || item?.key || item?.label || item
        if (!key) return
        if (kind === 'TRYING') {
          trying.push(String(key))
        } else {
          favorites.push(String(key))
        }
      })
      return { favorites, trying }
    }

    const fetchProfile = async () => {
      if (!username) return
      setLoading(true)
      setError(null)
      try {
        const res = (await api.profiles.getByUsername(username)) as ApiResponse<any>
        const data = res?.data ?? {}
        const user = data.user || data // Handle both nested and flat structures
        const sportsResp = Array.isArray(data.sports) ? data.sports : Array.isArray(user.sports) ? user.sports : []
        const { favorites, trying } = normalizeSports(sportsResp)

        const vibeKey = user.vibe_key || user.vibe || data.vibe || mate?.vibe
        const unionVibe = vibeKeyToUnion(vibeKey)

        setProfileData({
          name: user.display_name || user.username || mate?.name || username,
          username: user.username || mate?.name || username,
          vibe: (unionVibe || mate?.vibe) as MateCardProps['vibe'],
          vibeLabel: labelForVibe(vibeKey) || labelForVibe(mate?.vibe as string) || '',
          sports: favorites.length ? favorites : asStringArray(mate?.sports) || [],
          trying: trying.length ? trying : asStringArray(mate?.trying) || [],
          location: user.city_key || user.location || data.location || mate?.location || '',
          countryKey: user.nationality_key || (mate as any)?.countryKey || '',
          blurb: user.bio || user.blurb || data.blurb || mate?.blurb || '',
          friendCount: user.teammate_count || user.friend_count || 0,
          joinedCount: user.joined_count || 0,
          hostedCount: user.hosted_count || 0,
          avatar: user.avatar_url || user.avatar || data.avatar || mate?.avatar || '',
        })
      } catch (err: any) {
        console.error('load mate failed', err)
        const status = err?.status || err?.response?.status
        if (status === 404) {
          setError(`No one goes by that username.`)
        } else {
          setError("Couldn't load this profile. Try again.")
        }
        if (mate) {
          setProfileData({
            name: mate.name || username || 'Mate',
            username: mate.name || username || 'Mate',
            vibe: (mate.vibe as MateCardProps['vibe']) || 'Chill',
            vibeLabel: labelForVibe(mate.vibe as string),
            sports: asStringArray(mate.sports) || [],
            trying: asStringArray(mate.trying) || [],
            location: mate.location || '',
            countryKey: (mate as any).countryKey || '',
            blurb: mate.blurb || '',
            avatar: mate.avatar || '',
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username, mate, labelForSport, labelForVibe, vibeKeyToUnion])

  const profile: MateCardProps | null = useMemo(() => {
    if (!profileData && !mate) return null
    const base: MateCardProps =
      profileData ??
      ({
        name: mate?.name ?? username ?? 'New mate',
        username: mate?.name ?? username ?? 'New mate',
        vibe: (mate?.vibe as MateCardProps['vibe']) ?? 'Chill',
        sports: asStringArray(mate?.sports) ?? [],
        trying: asStringArray(mate?.trying) ?? [],
        location: mate?.location ?? '',
        countryKey: (mate as any)?.countryKey ?? '',
        blurb: mate?.blurb ?? '',
        friendCount: 0,
        joinedCount: 0,
        hostedCount: 0,
        avatar: mate?.avatar ?? '',
      } as MateCardProps)

    const vibeUnion = vibeKeyToUnion(base.vibe as unknown as string) as MateCardProps['vibe']

    return {
      ...base,
      vibe: vibeUnion,
      sports: (base.sports || []).map(labelForSport),
      trying: (base.trying || []).map(labelForSport),
      location: labelForCity(base.location || ''),
      vibeLabel: labelForVibe(base.vibe as unknown as string),
    }
  }, [mate, profileData, labelForSport, labelForVibe, labelForCity, vibeKeyToUnion, username])

  const headerName = profile?.username || profile?.name || username || ''
  const targetProfileUsername = (profile?.username || username || '').trim()

  useEffect(() => {
    if (!targetProfileUsername) {
      setHostedUpcomingEvents([])
      setIsHostedEventsLoading(false)
      return
    }

    let cancelled = false

    const loadHostedUpcomingEvents = async () => {
      setIsHostedEventsLoading(true)
      try {
        const response = await eventsService.getProfileEventsByUsername(targetProfileUsername, {
          role: 'hosted',
          time: 'upcoming',
          limit: 10,
          offset: 0,
        })
        const filtered = response.success ? (response.data?.data ?? []) : []
        if (!cancelled) {
          setHostedUpcomingEvents(filtered)
        }
      } catch (err) {
        console.error('Failed to load hosted upcoming events', err)
        if (!cancelled) {
          setHostedUpcomingEvents([])
        }
      } finally {
        if (!cancelled) setIsHostedEventsLoading(false)
      }
    }

    void loadHostedUpcomingEvents()

    return () => {
      cancelled = true
    }
  }, [targetProfileUsername])

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto w-full max-w-4xl pb-6">
        <div className="relative flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex w-10 items-center">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => state?.from === 'app' ? navigate(-1) : navigate('/events')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[68%] -translate-x-1/2 -translate-y-1/2 px-2 text-center">
            <span className="block truncate text-2xl font-bold text-slate-900">{headerName}</span>
          </div>
          <div className="flex w-10 items-center justify-end">
            {targetProfileUsername && (
              <button
                type="button"
                aria-label="Share profile"
                onClick={async () => {
                  const url = `${window.location.origin}/mate/${targetProfileUsername}`
                  const text = `Check out ${profile?.name || targetProfileUsername} on HopCourts`
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: 'HopCourts',
                        text,
                        url,
                      })
                    } else {
                      await navigator.clipboard.writeText(`${text}\n${url}`)
                    }
                  } catch {}
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700"
              >
                <Share className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {!error && loading && !profileData ? (
          <PageLoading
            fullScreen={false}
            className="py-20"
          />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4">
              <Frown className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Mate not found</h3>
            <p className="max-w-xs text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white"
            >
              Explore events
            </button>
          </div>
        ) : (
          profile && (
            <>
              <HeroCard
                profile={profile}
                showShare={false}
                actionDisabled={loading}
              />
              <div className="mt-4 space-y-3 px-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-lg font-semibold text-slate-700">Hosting soon</h3>
                  <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('calendar')}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition ${viewMode === 'calendar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {isHostedEventsLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    Loading...
                  </div>
                ) : (
                  <EventsViewPanel
                    events={hostedUpcomingEvents}
                    sportsCatalog={sportsDict}
                    onViewDetails={(id) => navigate(`/event/${id}`)}
                    viewMode={viewMode}
                  />
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}
