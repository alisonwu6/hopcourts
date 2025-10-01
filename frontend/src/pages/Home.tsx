import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Filter, MapPin, Plus } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import EventCardList from '@/components/event/EventCardList'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockEvents } from '@/mocks/event'
import { useCopy } from '@/i18n/LanguageProvider'

export default function Home() {
  const copy = useCopy()
  const homeCopy = copy.home
  const events = mockEvents
  const featuredEvent = events.find((event) => event.id === homeCopy.featuredEventId) ?? events[0]
  const featuredContent = featuredEvent
    ? copy.mockEvents.cards[featuredEvent.contentKey]
    : undefined

  return (
    <MainLayout
      title={homeCopy.heroTitle}
      description={homeCopy.heroDescription}
      actions={
        <Button
          asChild
          size="sm"
          className="gap-1"
        >
          <Link to="/create">
            <Plus className="h-4 w-4" /> {copy.header.newSession}
          </Link>
        </Button>
      }
    >
      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {homeCopy.trustSignals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="text-sm font-semibold text-slate-900">{signal.label}</div>
              <p className="mt-1 text-xs text-slate-500">{signal.description}</p>
            </div>
          ))}
        </div>

        {featuredEvent && featuredContent && (
          <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {homeCopy.nextOnCalendar}
                </span>
                <span>{homeCopy.streak}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays className="h-4 w-4" />
                  {featuredContent.time}
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">{featuredContent.title}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  {featuredContent.location}
                </div>
                <div className="text-xs text-slate-500">
                  {copy.common.hostedBy(featuredEvent.host.name)} · {copy.common.joinCounts(featuredEvent.joinedCount, featuredEvent.maxCount)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {featuredContent.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-full"
              >
                <Link to={`/sessions/${featuredEvent.id}`}>
                  {copy.eventCard.joinSession}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{homeCopy.invitesTitle}</h3>
              <p className="text-sm text-slate-500">{homeCopy.invitesSubtitle}</p>
            </div>
            <div className="space-y-3">
              {homeCopy.invites.map((invite) => (
                <div
                  key={invite.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-sm"
                >
                  <div className="font-medium text-slate-900">{invite.sport}</div>
                  <div className="text-slate-500">{copy.common.hostedBy(invite.host)}</div>
                  <div className="text-xs text-slate-500">
                    {invite.time} · {invite.location}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="secondary" className="rounded-full">
                      {copy.home.acceptInvite}
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full">
                      {copy.home.maybeInvite}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              asChild
              variant="ghost"
              className="justify-start gap-1 text-sm text-[var(--color-secondary)]"
            >
              <Link to="/notifications">
                {homeCopy.invitesLink} <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {homeCopy.quickFilters.slice(0, 3).map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
              >
                {filter}
              </Badge>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 rounded-full"
          >
            <Filter className="h-4 w-4" /> {copy.common.filters}
          </Button>
        </div>
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{copy.home.searchTitle}</h3>
              <p className="text-sm text-slate-500">{copy.home.searchDescription}</p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <input
                type="search"
                placeholder={homeCopy.searchPlaceholder}
                className="h-10 flex-1 rounded-full border border-slate-200 px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <Button variant="outline" className="rounded-full">
                {copy.common.search}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{copy.home.recommendedTitle}</h3>
          <Button
            asChild
            variant="ghost"
            className="gap-1 text-sm text-[var(--color-secondary)]"
          >
            <Link to="/map">
              {copy.common.viewOnMap} <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <EventCardList events={events} />
      </section>
    </MainLayout>
  )
}
