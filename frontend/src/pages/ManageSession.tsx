import { Link, useParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const roster = ['Alex', 'Bo', 'Chen', 'Dana', 'Eli', 'Faye', 'Gus', 'Hana']
const waitlist = ['Ivy', 'Jules']

export default function ManageSession() {
  const { id } = useParams()

  return (
    <MainLayout
      title="Manage session"
      description="Keep your roster tidy and share updates with players."
      actions={
        <Button
          asChild
          size="sm"
          variant="outline"
        >
          <Link to={`/sessions/${id}`}>View public session</Link>
        </Button>
      }
      contentWidth="md"
    >
      <section className="space-y-4">
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Confirmed players</span>
              <span>{roster.length} / 10</span>
            </div>
            <ul className="grid gap-2 text-sm">
              {roster.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <span>{name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Message</Button>
                    <Button size="sm" variant="ghost">Remove</Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Copy invite link</Button>
              <Button variant="outline" size="sm">Export roster</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div className="text-sm font-semibold text-slate-900">Waitlist</div>
            {waitlist.length === 0 ? (
              <p className="text-sm text-slate-500">No one waiting. Share the session to fill remaining spots.</p>
            ) : (
              <ul className="grid gap-2 text-sm">
                {waitlist.map((name) => (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                  >
                    <span>{name}</span>
                    <div className="flex gap-2">
                      <Button size="sm">Approve</Button>
                      <Button size="sm" variant="ghost">Decline</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
            <Button variant="outline">Send update to roster</Button>
            <Button variant="outline">Cancel session</Button>
            <Button variant="outline">Duplicate session</Button>
            <Button variant="outline">Open feedback form</Button>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
