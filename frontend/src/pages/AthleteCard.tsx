import MainLayout from '@/layouts/MainLayout'
import Header from '@/components/navigation/Header'
export default function AthleteCard() {
  return (
    <MainLayout>
      <Header />
      <main className="mx-auto max-w-md p-4 space-y-3">
        <div className="w-24 h-24 rounded-full bg-slate-200" />
        <h2 className="text-xl font-semibold">Alison</h2>
        <div className="text-slate-600">Brisbane · Basketball</div>
        <div className="flex gap-2 text-sm">
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
            Shooting
          </span>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
            Defense
          </span>
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
            Teamwork
          </span>
        </div>
      </main>
    </MainLayout>
  )
}
