import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, Star, MapPin } from 'lucide-react'
import { EventCardProps } from '@/interfaces/event'

export default function EventCard({
  id,
  title,
  location,
  time,
  joinedCount,
  maxCount,
  timeLeft,
  host,
  tags,
  participants,
  sport,
  skillLevel,
  description,
}: EventCardProps) {
  return (
    <Card className="w-full border border-slate-200 bg-white shadow-sm transition hover:border-blue-200">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              {sport && (
                <Badge variant="outline">{sport}</Badge>
              )}
              {skillLevel && (
                <Badge variant="secondary">{skillLevel}</Badge>
              )}
              <Badge variant="outline" className="border-emerald-200 text-emerald-600">
                Starts in {timeLeft}
              </Badge>
            </div>
            <Link
              to={`/sessions/${id}`}
              className="text-lg font-semibold leading-tight text-slate-900 hover:text-blue-600"
            >
              {title}
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              {location}
            </div>
          </div>
          <div className="flex flex-none items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600">
            <Users className="h-4 w-4 text-slate-400" />
            {joinedCount} / {maxCount} spots filled
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            {time}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={host.avatarUrl} />
            <AvatarFallback>{host.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium text-slate-900">Hosted by {host.name}</div>
            <div className="text-slate-500">{host.tag}</div>
          </div>
        </div>

        {description && (
          <p className="text-sm text-slate-600">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-slate-200"
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
            className="flex-1"
          >
            <Link to={`/sessions/${id}`}>Join session</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="sm:w-auto"
          >
            <Link
              to={`/sessions/${id}`}
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
