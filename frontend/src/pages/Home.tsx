import Header from '@/components/navigation/Header'
import MainLayout from '@/layouts/MainLayout'
import EventList from '@/components/event/EventCardList'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const mock = [
  {
    id: '1',
    title: 'Casual Basketball',
    time: 'Today 18:00',
    place: 'QUT Gardens',
    cap: '8/10',
  },
  {
    id: '2',
    title: 'Yoga Flow',
    time: 'Tomorrow 07:00',
    place: 'South Bank',
    cap: '12/15',
  },
]

export default function Home() {
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-5xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Explore</h2>
          <Link to="/create">
            <Button>+ Create Session</Button>
          </Link>
        </div>
        {/* <div className="grid gap-3"> */}
        {/* {mock.map((s) => (
            <Card key={s.id}>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-slate-600">
                    {s.time} · {s.place}
                  </div>
                  <div className="text-xs text-slate-500">Capacity {s.cap}</div>
                </div>
                <Link to={`/sessions/${s.id}`}>
                  <Button variant="secondary">View</Button>
                </Link>
              </div>
            </Card>
          ))} */}
        {/* </div> */}
        {/* <h1 className="text-xl font-bold mb-4">Open Games</h1> */}
        <EventList />
      </main>
    </MainLayout>
  )
}
