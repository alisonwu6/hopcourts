import { supabase } from '@/lib/supabase'

const redirect =
  import.meta.env.VITE_SUPABASE_EMAIL_REDIRECT ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : undefined)

function ensureSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }
  return supabase
}

export async function signInWithEmail(email: string, password: string) {
  const client = ensureSupabase()
  return client.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email: string, password: string) {
  const client = ensureSupabase()
  return client.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirect },
  })
}

export async function resetPassword(email: string) {
  const client = ensureSupabase()
  return client.auth.resetPasswordForEmail(email, { redirectTo: redirect })
}

export async function signInWithGoogle() {
  const client = ensureSupabase()
  return client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirect },
  })
}

export async function signInWithApple() {
  const client = ensureSupabase()
  return client.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: redirect },
  })
}

export async function signOut() {
  const client = ensureSupabase()
  return client.auth.signOut()
}
