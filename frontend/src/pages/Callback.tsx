import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Callback() {
  const nav = useNavigate()
  useEffect(() => {
    // TODO: 交換 code -> token；暫時直接導回首頁
    nav('/home', { replace: true })
  }, [nav])
  return <div className="p-8">Signing you in…</div>
}
