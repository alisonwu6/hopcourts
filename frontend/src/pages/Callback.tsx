import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent } from '@/components/ui/card'

export default function Callback() {
  const nav = useNavigate()

  useEffect(() => {
    nav('/home', { replace: true })
  }, [nav])

  return (
    <MainLayout
      showHeader={false}
      showBottomNav={false}
      contentWidth="sm"
    >
      <Card className="border border-slate-200">
        <CardContent className="space-y-3 p-6 text-center">
          <div className="text-lg font-semibold text-slate-900">Signing you in…</div>
          <p className="text-sm text-slate-500">Hang tight while we complete authentication.</p>
        </CardContent>
      </Card>
    </MainLayout>
  )
}
