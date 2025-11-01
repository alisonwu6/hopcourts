import { Link, useParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatJoinCounts } from '@/lib/text'

export default function ManageSession() {
  const { id } = useParams()

  return (
    <MainLayout
      title="Manage game"
      description="Keep your roster tidy and share updates with players."
      actions={
        <Button asChild size="sm" variant="outline" className="border-host-600 text-host-600 hover:bg-host-50">
          <Link to={`/sessions/${id}`}>View public game</Link>
        </Button>
      }
      contentWidth="page"
    >
      <section className="space-y-4">
        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Confirmed players</span>
              <span>{formatJoinCounts(8, 10)}</span>
            </div>
            <ul className="grid gap-2 text-sm">
              {['Alex', 'Bo', 'Chen', 'Dana', 'Eli', 'Faye', 'Gus', 'Hana'].map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <span>{name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-host-600 text-host-600 hover:bg-host-50">
                      Message
                    </Button>
                    <Button size="sm" variant="ghost" className="text-host-600 hover:text-host-700">
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="border-host-600 text-host-600 hover:bg-host-50">
                Copy invite link
              </Button>
              <Button variant="outline" size="sm" className="border-host-600 text-host-600 hover:bg-host-50">
                Export roster
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div className="text-sm font-semibold text-slate-900">Waitlist</div>
            <ul className="grid gap-2 text-sm">
              {['Ivy', 'Jules'].map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
                >
                  <span>{name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-host-600 text-white hover:bg-host-700">
                      Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="text-host-600 hover:text-host-700">
                      Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
            <Button variant="outline" className="border-host-600 text-host-600 hover:bg-host-50">
              Send update to roster
            </Button>
            <Button variant="outline" className="border-host-600 text-host-600 hover:bg-host-50">
              Cancel game
            </Button>
            <Button variant="outline" className="border-host-600 text-host-600 hover:bg-host-50">
              Duplicate game
            </Button>
            <Button variant="outline" className="border-host-600 text-host-600 hover:bg-host-50">
              Open feedback form
            </Button>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}
