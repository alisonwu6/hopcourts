import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { useCopy } from '@/i18n/LanguageProvider'

export default function Callback() {
  const nav = useNavigate()
  const copy = useCopy()

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
          <div className="text-lg font-semibold text-slate-900">{copy.callback.signingIn}</div>
          <p className="text-sm text-slate-500">{copy.callback.subcopy}</p>
        </CardContent>
      </Card>
    </MainLayout>
  )
}
