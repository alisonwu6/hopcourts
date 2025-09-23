import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
import { Button } from '@/components/ui/button'
export default function Reconnect() {
  const suggestions = ['Bo', 'Chen', 'Dana']
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-md p-4 space-y-3">
        <h2 className="text-xl font-semibold">Reconnect</h2>
        <p className="text-slate-600">How was the run?</p>
        <div className="flex gap-2">
          <Button variant="secondary">👍</Button>
          <Button variant="secondary">👎</Button>
        </div>
        <h3 className="font-medium mt-4">People you may add</h3>
        <ul className="grid gap-2">
          {suggestions.map((n) => (
            <li
              key={n}
              className="flex items-center justify-between border p-2 rounded"
            >
              <div>{n}</div>
              <Button>Add to Squad</Button>
            </li>
          ))}
        </ul>
      </main>
    </MainLayout>
  )
}
