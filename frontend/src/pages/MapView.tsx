import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
export default function MapView() {
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-5xl p-4">
        <h2 className="text-xl font-semibold mb-2">Map</h2>
        <div className="rounded-lg border border-slate-200 h-[420px] grid place-items-center text-slate-500">
          Map placeholder
        </div>
      </main>
    </MainLayout>
  )
}
