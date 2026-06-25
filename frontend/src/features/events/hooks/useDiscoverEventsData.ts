import { useCallback, useMemo } from 'react'
import type { SetURLSearchParams } from 'react-router-dom'
import { format, startOfDay } from 'date-fns'
import type { EventFilter, PlayerEvent, User } from '@/types'
import type { Sport } from '@/types/dictionary'
import { useFeedEventsQuery } from '@/features/events/hooks/useFeedEventsQuery'

export type DiscoverSportFilterOption = { key: string; label: string; icon?: string | null; category?: string }

type SuggestionType = 'interests' | 'hosts'

type DiscoverEventsDataInput = {
  events: PlayerEvent[]
  sportsCatalog: Sport[]
  isAuthenticated: boolean
  user: User | null
  suggestionType: SuggestionType
  searchParams: URLSearchParams
  setSearchParams: SetURLSearchParams
}

type FeedType = 'interests' | 'relations'

export function useDiscoverEventsData({
  events,
  sportsCatalog,
  isAuthenticated,
  user,
  suggestionType,
  searchParams,
  setSearchParams,
}: DiscoverEventsDataInput) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const showMap = searchParams.get('view') === 'map'
  const selectedEventId = searchParams.get('event')

  const feedType: FeedType = suggestionType === 'interests' ? 'interests' : 'relations'
  const feedQuery = useFeedEventsQuery(feedType, isAuthenticated)
  const feedItems = feedQuery.data?.data?.data ?? []

  const sportsParam = searchParams.get('sports')
  const startParam = searchParams.get('startDate')
  const endParam = searchParams.get('endDate')

  const selectedSports = useMemo(() => {
    if (!sportsParam) return ['all']
    return sportsParam.split(',')
  }, [sportsParam])

  const dateRange = useMemo(
    () => ({
      start: startParam ? new Date(startParam) : null,
      end: endParam ? new Date(endParam) : null,
    }),
    [startParam, endParam]
  )

  const sports = useMemo<DiscoverSportFilterOption[]>(
    () =>
      sportsCatalog.map((sport) => ({
        key: sport.key,
        label: sport.label,
        icon: sport.icon,
        category: sport.category,
      })),
    [sportsCatalog]
  )

  const eventsByDay = useMemo(
    () =>
      events.reduce<Record<string, number>>((accumulator, event) => {
        const key = startOfDay(new Date(event.startTime)).toISOString()
        accumulator[key] = (accumulator[key] ?? 0) + 1
        return accumulator
      }, {}),
    [events]
  )

  // Server handles sport + date filtering; events are already filtered
  const filteredEvents = events

  const activeFilter = useMemo<EventFilter>(() => {
    const filter: EventFilter = {}
    if (dateRange.start) filter.startDate = dateRange.start
    if (dateRange.end) filter.endDate = dateRange.end
    if (!selectedSports.includes('all') && selectedSports.length > 0) {
      filter.sportKeys = selectedSports
    }
    return filter
  }, [dateRange, selectedSports])

  const suggestedEvents = useMemo(() => {
    if (!isAuthenticated || !user) return []

    let localMatched: PlayerEvent[] = []
    if (suggestionType === 'interests') {
      const userSports = (user.sports || []).map((sport) => sport.toLowerCase())
      localMatched = events.filter(
        (event) =>
          event.host.id !== user.id &&
          userSports.includes(event.sport.toLowerCase()) &&
          new Date(event.startTime) >= today
      )
    } else {
      const following = user.following || []
      localMatched = events.filter(
        (event) =>
          event.host.id !== user.id && following.includes(event.host.id) && new Date(event.startTime) >= today
      )
    }

    const backendMatched = feedItems.filter(
      (event) => event.host.id !== user.id && new Date(event.startTime) >= today
    )
    return (backendMatched.length > 0 ? backendMatched : localMatched).slice(0, 6)
  }, [events, feedItems, isAuthenticated, suggestionType, today, user])

  const dateLabel = dateRange.start
    ? dateRange.end
      ? `${format(dateRange.start, 'MM/dd')} - ${format(dateRange.end, 'MM/dd')}`
      : format(dateRange.start, 'MM/dd')
    : 'Any time'

  const sportLabel = useMemo(() => {
    if (selectedSports.includes('all')) return 'Any sport'

    const names = selectedSports
      .map((key) => sports.find((sport) => sport.key === key)?.label)
      .filter(Boolean) as string[]

    if (names.length === 0) return 'Sport'
    if (names.length <= 2) return names.join('、')
    return `${names[0]}、${names[1]} +${names.length - 2}`
  }, [selectedSports, sports])

  const hasFilter = Boolean(dateRange.start || !selectedSports.includes('all'))

  const toggleMap = useCallback(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (showMap) next.delete('view')
        else next.set('view', 'map')
        return next
      },
      { replace: true }
    )
  }, [setSearchParams, showMap])

  const clearFilters = useCallback(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('startDate')
        next.delete('endDate')
        next.delete('sports')
        return next
      },
      { replace: true }
    )
  }, [setSearchParams])

  const selectMapEvent = useCallback(
    (event: PlayerEvent | null) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (event) next.set('event', event.id)
          else next.delete('event')
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const applyFilters = useCallback(
    (range: { start: Date | null; end: Date | null }, selected: string[]) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (range.start) next.set('startDate', range.start.toISOString())
          else next.delete('startDate')

          if (range.end) next.set('endDate', range.end.toISOString())
          else next.delete('endDate')

          if (selected.length && !selected.includes('all')) {
            next.set('sports', selected.join(','))
          } else {
            next.delete('sports')
          }
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return {
    showMap,
    selectedEventId,
    selectedSports,
    dateRange,
    sports,
    eventsByDay,
    filteredEvents,
    suggestedEvents,
    dateLabel,
    sportLabel,
    hasFilter,
    activeFilter,
    toggleMap,
    clearFilters,
    selectMapEvent,
    applyFilters,
  }
}
