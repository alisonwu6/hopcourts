import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
import { Button } from '@/components/ui/button'
export default function ManageSession() {
  const roster = ['Alex', 'Bo', 'Chen', 'Dana', 'Eli', 'Faye', 'Gus', 'Hana']
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">Manage Session</h2>
        <div className="text-sm text-slate-600">Capacity 8/10</div>
        <ul className="grid gap-2">
          {roster.map((n) => (
            <li
              key={n}
              className="border p-2 rounded"
            >
              {n}
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button variant="secondary">Copy invite link</Button>
          <Button variant="outline">Cancel session</Button>
        </div>
      </main>
    </MainLayout>
  )
}
