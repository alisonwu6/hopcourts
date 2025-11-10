import { supabase } from '@/lib/supabase'

export async function requireAuth() {
  if (!supabase) {
    window.location.href = '/login'
    return
  }
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    window.location.href = '/login'
  }
}
