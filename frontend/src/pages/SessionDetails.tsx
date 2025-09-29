import { Link, useParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { mockEvents } from '@/mocks/event'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarClock, MapPin, Users, MessageCircle } from 'lucide-react'
import { useCopy } from '@/i18n/LanguageProvider'

export default function SessionDetails() {
  const { id } = useParams()
  const copy = useCopy()
  const event = mockEvents.find((session) => session.id === id)

  if (!event) {
    return (
      <MainLayout
        title={copy.sessionDetails.notFoundTitle}
        description={copy.sessionDetails.notFoundCopy}
      >
        <Card>
          <CardContent className="space-y-4 p-6 text-sm text-slate-600">
            <Button
              asChild
              className="w-fit"
            >
              <Link to="/home">{copy.sessionDetails.backToExplore}</Link>
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  const content = copy.mockEvents[event.contentKey]
  const sportLabel = copy.mockEvents.sportNames[event.sport]
  const skillLabel = event.skillLevel ? copy.mockEvents.skillLevels[event.skillLevel] : undefined

  return (
    <MainLayout
      title={content.title}
      description={`${content.location} · ${content.time}`}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/sessions/${event.id}/manage`}>{copy.manageSession.title}</Link>
          </Button>
          <Button asChild>
            <Link to={`/sessions/${event.id}/joined`}>{copy.eventCard.joinSession}</Link>
          </Button>
        </div>
      }
      contentWidth="xl"
    >
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border border-slate-200">
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              <Badge variant="outline">{sportLabel}</Badge>
              {skillLabel && <Badge variant="secondary">{skillLabel}</Badge>}
              <Badge
                variant="outline"
                className="border-emerald-200 text-emerald-600"
              >
                {copy.common.rosterCount(event.joinedCount, event.maxCount)}
              </Badge>
            </div>
            {content.description && (
              <p className="text-sm leading-relaxed text-slate-600">
                {content.description}
              </p>
            )}
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
              <div className="flex items-start gap-2">
                <CalendarClock className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-900">{copy.sessionDetails.whenLabel}</div>
                  <div>{content.time}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-900">{copy.sessionDetails.whereLabel}</div>
                  <div>{content.location}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-900">{copy.sessionDetails.capacityLabel}</div>
                  <div>{copy.common.joinCounts(event.joinedCount, event.maxCount)}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {content.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{copy.sessionDetails.bringTitle}</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600">
                {copy.sessionDetails.bringList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border border-slate-200">
            <CardContent className="flex gap-4 p-6">
              <Avatar className="h-14 w-14">
                <AvatarImage src={event.host.avatarUrl} />
                <AvatarFallback>{event.host.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{copy.common.hostedBy(event.host.name)}</div>
                  <div className="text-slate-500">{event.host.tag}</div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <Link to={`/u/${event.host.name.toLowerCase()}`}>
                    <MessageCircle className="h-4 w-4" /> {copy.common.message}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardContent className="space-y-3 p-6">
              <div className="text-sm font-semibold text-slate-900">{copy.manageSession.confirmedPlayers}</div>
              <div className="flex -space-x-2">
                {event.participants.map((avatarUrl, index) => (
                  <Avatar
                    key={avatarUrl}
                    className="h-9 w-9 border border-white ring-1 ring-slate-200"
                  >
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{index + 1}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-xs text-slate-500">{copy.common.spotsAvailable(event.maxCount - event.participants.length)}</p>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="justify-start text-blue-600"
              >
                <Link to={`/sessions/${event.id}/manage`}>{copy.manageSession.title}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Card className="border border-slate-200">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{copy.sessionDetails.followUpTitle}</h3>
              <p className="text-sm text-slate-500">
                {copy.sessionDetails.followUpDescription}
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Button variant="outline">{copy.sessionDetails.followUpActions[0]}</Button>
              <Button variant="outline">{copy.sessionDetails.followUpActions[1]}</Button>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Button variant="outline">{copy.sessionDetails.followUpActions[2]}</Button>
              <Button variant="outline">{copy.sessionDetails.followUpActions[3]}</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
