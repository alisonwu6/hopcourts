import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
export default function Notifications() {
  const items = [
    { id: 1, text: 'Bo joined your session' },
    { id: 2, text: 'Yoga Flow starts in 1h' },
  ]
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-md p-4 space-y-3">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <ul className="grid gap-2">
          {items.map((i) => (
            <li
              key={i.id}
              className="border p-2 rounded"
            >
              {i.text}
            </li>
          ))}
        </ul>
      </main>
    </MainLayout>
  )
}
