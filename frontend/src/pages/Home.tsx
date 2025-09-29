import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Flame, Filter, MapPin, Plus } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import EventCardList from '@/components/event/EventCardList'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockEvents } from '@/mocks/event'
import { useCopy } from '@/i18n/LanguageProvider'

export default function Home() {
  const copy = useCopy()
  const nextSession = mockEvents[0]
  const nextSessionContent = copy.mockEvents[nextSession.contentKey]

  return (
    <MainLayout
      title={copy.home.title}
      description={copy.home.description}
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
      {nextSession && (
        <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <Card className="bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-400 text-white">
            <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
                <span>{copy.home.nextOnCalendar}</span>
                <Badge className="bg-white/20 text-white">
                  <Flame className="mr-1 h-3 w-3" /> {copy.home.streak}
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <CalendarDays className="h-4 w-4" />
                  {nextSessionContent.time}
                </div>
                <h2 className="text-2xl font-semibold">{nextSessionContent.title}</h2>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <MapPin className="h-4 w-4" />
                  {nextSessionContent.location}
                </div>
                <div className="text-xs text-white/70">
                  {copy.common.hostedBy(nextSession.host.name)} · {copy.common.joinCounts(nextSession.joinedCount, nextSession.maxCount)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {nextSessionContent.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-white/20 text-white"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                asChild
                variant="secondary"
                className="self-start bg-white text-blue-600 hover:bg-white/90"
              >
                <Link to={`/sessions/${nextSession.id}`}>
                  {copy.eventCard.joinSession}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white">
            <CardContent className="flex h-full flex-col gap-4 p-5">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{copy.home.invitesTitle}</h3>
                <p className="text-sm text-slate-500">{copy.home.invitesSubtitle}</p>
              </div>
              <div className="space-y-3">
                {copy.home.invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-lg border border-slate-200 p-3 text-sm"
                  >
                    <div className="font-medium text-slate-900">{invite.sport}</div>
                    <div className="text-slate-500">{copy.common.hostedBy(invite.host)}</div>
                    <div className="text-xs text-slate-500">
                      {invite.time} · {invite.location}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="gap-1">
                        {copy.home.acceptInvite}
                      </Button>
                      <Button size="sm" variant="ghost">
                        {copy.home.maybeInvite}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                asChild
                variant="ghost"
                className="justify-start gap-1 text-sm text-blue-600"
              >
                <Link to="/notifications">
                  {copy.home.invitesLink} <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {copy.home.quickFilters.map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="cursor-pointer rounded-full px-3 py-1 text-xs"
              >
                {filter}
              </Badge>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Filter className="h-4 w-4" /> {copy.common.filters}
          </Button>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{copy.home.searchTitle}</h3>
              <p className="text-sm text-slate-500">{copy.home.searchDescription}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="search"
                placeholder={copy.home.searchPlaceholder}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-64"
              />
              <Button variant="secondary">{copy.common.search}</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{copy.home.recommendedTitle}</h3>
          <Button
            asChild
            variant="ghost"
            className="gap-1 text-sm text-blue-600"
          >
            <Link to="/map">
              {copy.common.viewOnMap} <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <EventCardList events={mockEvents} />
      </section>
    </MainLayout>
  )
}
