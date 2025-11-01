import { Link, useParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { mockEvents } from '@/mocks/event'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CalendarClock, MapPin, Users, MessageCircle } from 'lucide-react'
import { EVENT_CARDS, SPORT_LABELS, SKILL_LEVEL_LABELS } from '@/data/mock/events'
import { formatHostedBy, formatJoinCounts, formatRosterCount, formatSpotsAvailable } from '@/lib/text'

export default function SessionDetails() {
  const { id } = useParams()
  const event = mockEvents.find((session) => session.id === id)

  if (!event) {
    return (
      <MainLayout
        title="Session not found"
        description="This session may have been cancelled or moved."
      >
        <Card>
          <CardContent className="space-y-4 p-6 text-sm text-slate-600">
            <Button
              asChild
              className="w-fit"
            >
              <Link to="/home">Back to explore</Link>
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  const contentKey = event.contentKey as keyof typeof EVENT_CARDS
  const content = EVENT_CARDS[contentKey] ?? {
    title: 'Upcoming session',
    location: 'Location to be announced',
    time: 'Time to be announced',
    description: '',
    tags: [] as string[],
  }
  const sportLabel = SPORT_LABELS[event.sport as keyof typeof SPORT_LABELS] ?? event.sport
  const skillLabel = event.skillLevel ? SKILL_LEVEL_LABELS[event.skillLevel as keyof typeof SKILL_LEVEL_LABELS] : undefined

  return (
    <MainLayout
      title={content.title}
      description={`${content.location} · ${content.time}`}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/session/${event.id}/manage`}>Manage session</Link>
          </Button>
          <Button asChild>
            <Link to={`/session/${event.id}/joined`}>Join session</Link>
          </Button>
        </div>
      }
      contentWidth="page"
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
                {formatRosterCount(event.joinedCount, event.maxCount)}
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
                  <div className="font-medium text-slate-900">When</div>
                  <div>{content.time}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-900">Where</div>
                  <div>{content.location}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <div className="font-medium text-slate-900">Capacity</div>
                  <div>{formatJoinCounts(event.joinedCount, event.maxCount)}</div>
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
              <h3 className="text-sm font-semibold text-slate-900">Bring</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600">
                {[
                  'Arrive 10 minutes early for warm up',
                  'Comfortable shoes and water bottle',
                  'Optional: spare ball for shooting drills',
                ].map((item) => (
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
                  <div className="text-sm font-semibold text-slate-900">{formatHostedBy(event.host.name)}</div>
                  <div className="text-slate-500">{event.host.tag}</div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <Link to={`/u/${event.host.name.toLowerCase()}`}>
                    <MessageCircle className="h-4 w-4" /> Message
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardContent className="space-y-3 p-6">
              <div className="text-sm font-semibold text-slate-900">Confirmed players</div>
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
              <p className="text-xs text-slate-500">{formatSpotsAvailable(event.maxCount - event.participants.length)}</p>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="justify-start text-blue-600"
              >
                <Link to={`/session/${event.id}/manage`}>Manage session</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Card className="border border-slate-200">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Post-session follow up</h3>
              <p className="text-sm text-slate-500">
                Keep the momentum. Add it to your calendar and invite your squad.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Button variant="outline">Add to calendar (.ics)</Button>
              <Button variant="outline">Share to group chat</Button>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Button variant="outline">Mark attendance</Button>
              <Button variant="outline">Request host review</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
