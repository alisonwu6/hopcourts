import MainLayout from '@/layouts/MainLayout'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SKILL_LEVEL_LABELS } from '@/data/mock/events'

export default function CreateSession() {
  return (
    <MainLayout
      title="Create a session"
      description="Share the details and SportsMatch will help you fill the roster."
      contentWidth="page"
    >
      <div className="-mx-4 sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-700">
            Session controls
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" type="button">
              Save draft
            </Button>
            <Button variant="outline" size="sm" type="button">
              Preview session
            </Button>
            <Button size="sm" type="submit" form="session-form">
              Publish session
            </Button>
          </div>
        </div>
      </div>
      <form id="session-form" className="space-y-6">
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Session basics</h2>
              <p className="text-sm text-slate-500">
                Tell players what they can expect and where to meet.
              </p>
            </div>
            <Input
              label="Title"
              placeholder="Sunrise tempo run"
            />
            <Input
              label="Sport"
              placeholder="Running"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Date & start time"
                type="datetime-local"
              />
              <Input
                label="Duration (minutes)"
                type="number"
                placeholder="90"
              />
            </div>
            <Input
              label="Location"
              placeholder="New Farm Park Riverwalk"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Capacity"
                type="number"
                placeholder="10"
              />
              <label className="grid gap-1 text-sm text-slate-600">
                Skill level
                <select className="h-10 rounded border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">Select level</option>
                  {Object.entries(SKILL_LEVEL_LABELS).map(([level, label]) => (
                    <option
                      key={level}
                      value={level}
                    >
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm text-slate-600">
              Description
              <textarea
                rows={4}
                placeholder="Outline the vibe, meeting spot, and any warm up plans..."
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Session vibe</h2>
              <p className="text-sm text-slate-500">
                Tag your session so the right athletes can discover it.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {['Beginner friendly', 'Competitive', 'Social', 'Coffee after'].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer rounded-full px-3 py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <label className="grid gap-1 text-sm text-slate-600">
              Notes for attendees
              <textarea
                rows={3}
                placeholder="Anything they should bring or know before the session?"
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <span className="text-xs text-slate-500">Visible only to people who join.</span>
            </label>
          </CardContent>
        </Card>

      </form>
    </MainLayout>
  )
}
