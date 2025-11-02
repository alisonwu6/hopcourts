import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, Star, MapPin } from 'lucide-react'
import { EventCardProps } from '@/interfaces/event'
import { EVENT_CARDS, SPORT_LABELS, SKILL_LEVEL_LABELS } from '@/data/mock/events'
import { formatHostedBy, formatJoinCounts, formatStartsIn } from '@/lib/text'

export default function EventCard({
  id,
  contentKey,
  sport,
  skillLevel,
  joinedCount,
  maxCount,
  timeLeft,
  host,
  participants,
}: EventCardProps) {
  const content = EVENT_CARDS[contentKey as keyof typeof EVENT_CARDS]
  const sportLabel = SPORT_LABELS[sport as keyof typeof SPORT_LABELS] ?? sport
  const skillLabel = skillLevel ? SKILL_LEVEL_LABELS[skillLevel as keyof typeof SKILL_LEVEL_LABELS] : undefined

  if (!content) {
    return null
  }

  return (
    <Card className="relative w-full overflow-hidden rounded-3xl border border-slate-100 bg-white/95 shadow-sm">
      <span className="absolute inset-x-6 top-0 h-1 rounded-full bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-primary)] to-[var(--color-accent)]" />
      <CardContent className="space-y-4 p-6 pt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <Badge
                variant="outline"
                className="border-[var(--color-secondary)] bg-white text-[var(--color-secondary)]"
              >
                {sportLabel}
              </Badge>
              {skillLabel && (
                <Badge
                  variant="outline"
                  className="border-transparent bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                >
                  {skillLabel}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="border-transparent bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              >
                {formatStartsIn(timeLeft)}
              </Badge>
            </div>
            <Link
              to={`/games/${id}`}
              className="text-lg font-semibold leading-tight text-slate-900 hover:text-blue-600"
            >
              {content.title}
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              {content.location}
            </div>
          </div>
          <div className="flex flex-none items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1.5 text-xs text-slate-600">
            <Users className="h-4 w-4 text-slate-400" />
            <span>{formatJoinCounts(joinedCount, maxCount)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            {content.time}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={host.avatarUrl} />
            <AvatarFallback>{host.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium text-slate-900">{formatHostedBy(host.name)}</div>
            <div className="text-slate-500">{host.tag}</div>
          </div>
        </div>

        {content.description && (
          <p className="text-sm text-slate-600">
            {content.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {content.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-transparent bg-[var(--color-globe-teal)]/10 text-[var(--color-globe-teal)]"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex -space-x-2">
          {participants.map((avatarUrl, index) => (
            <Avatar
              key={avatarUrl}
              className="h-8 w-8 border border-white ring-1 ring-slate-200"
            >
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{index + 1}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            asChild
            className="flex-1 rounded-full"
          >
            <Link to={`/games/${id}`}>Join game</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-full sm:w-auto"
          >
            <Link
              to={`/games/${id}`}
              className="flex items-center gap-1"
            >
              <Star className="h-4 w-4" /> Save for later
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
