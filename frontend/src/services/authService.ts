import { supabase } from '@/lib/supabase'

const authRedirect =
  import.meta.env.VITE_SUPABASE_AUTH_REDIRECT ||
  (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined)

const resetRedirect =
  import.meta.env.VITE_SUPABASE_RESET_REDIRECT ||
  (typeof window !== 'undefined' ? `${window.location.origin}/auth/reset` : undefined)

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.')
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
    options: { emailRedirectTo: authRedirect },
  })
}

export async function resetPassword(email: string) {
  const client = ensureSupabase()
  return client.auth.resetPasswordForEmail(email, { redirectTo: resetRedirect })
}

function buildRedirectUrl(returnTo?: string): string | undefined {
  if (!authRedirect) return undefined
  if (!returnTo || !returnTo.startsWith('/')) return authRedirect
  const url = new URL(authRedirect)
  url.searchParams.set('returnTo', returnTo)
  return url.toString()
}

export async function signInWithGoogle(returnTo?: string) {
  const client = ensureSupabase()
  const isDev = import.meta.env.DEV
  return client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: buildRedirectUrl(returnTo),
      queryParams: isDev ? { prompt: 'select_account' } : undefined,
    },
  })
}

export async function signInWithApple(returnTo?: string) {
  const client = ensureSupabase()
  return client.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: buildRedirectUrl(returnTo) },
  })
}

export async function signOut() {
  const client = ensureSupabase()
  return client.auth.signOut()
}

// Anonymous sign-in for guest "tap-in" flow. Stores display name in user_metadata
// so the backend (verifyToken middleware) can mirror it into public.users.
export async function signInAnonymouslyAsGuest(displayName: string) {
  const client = ensureSupabase()
  const trimmed = displayName.trim().slice(0, 40)
  return client.auth.signInAnonymously({
    options: { data: { display_name: trimmed } },
  })
}
