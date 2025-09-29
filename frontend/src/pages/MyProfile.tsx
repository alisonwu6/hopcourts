import MainLayout from '@/layouts/MainLayout'
import Input from '@/components/ui/Input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const skills = ['Playmaking', 'Defense', 'Consistency']
const availability = ['Mon', 'Wed', 'Thu', 'Sat']

export default function MyProfile() {
  return (
    <MainLayout
      title="Your athlete card"
      description="Keep this current so hosts know what you bring."
      contentWidth="md"
      actions={<Button variant="outline" size="sm">View public card</Button>}
    >
      <section>
        <Card className="border border-slate-200">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-base font-semibold text-slate-900">Alex Blue</div>
                <div className="text-slate-500">Brisbane · Basketball & Running</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="rounded-full px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                Joined Feb 2025 · 18 sessions hosted · 42 joined
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <form className="space-y-6">
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Basics</h2>
              <p className="text-sm text-slate-500">Update how people address and find you.</p>
            </div>
            <Input
              label="Display name"
              placeholder="Alex Blue"
            />
            <Input
              label="Home suburb"
              placeholder="West End"
            />
            <Input
              label="Primary sport"
              placeholder="Basketball"
            />
            <label className="grid gap-1 text-sm text-slate-600">
              Bio
              <textarea
                rows={3}
                placeholder="Share a little about your playing style, goals or favourite sessions."
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Availability & preferences</h2>
              <p className="text-sm text-slate-500">Helps SportsMatch suggest sessions that fit.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm text-slate-600">
                Preferred days
                <div className="flex flex-wrap gap-2">
                  {availability.map((day) => (
                    <Badge
                      key={day}
                      variant="outline"
                      className="rounded-full px-3 py-1"
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </label>
              <label className="grid gap-1 text-sm text-slate-600">
                Time of day
                <select className="h-10 rounded border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option>Early mornings</option>
                  <option>Lunch sessions</option>
                  <option>After work</option>
                  <option>Weekend warrior</option>
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm text-slate-600">
              Looking for
              <textarea
                rows={3}
                placeholder="Eg: Social weeknight runs, mixed basketball scrims, casual volleyball."
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="ghost">Cancel</Button>
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </MainLayout>
  )
}
