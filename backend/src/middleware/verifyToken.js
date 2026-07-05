const {
  findUserByEmail,
  getUserById,
  createUserFromSupabaseProfile,
  updateUserId,
} = require('../../models/users.model')
const supabase = require('../utils/supabase')

async function getSupabaseUserFromToken(token) {
  if (!supabase) return undefined
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error) {
      if (error.status === 401) {
        return null
      }
      console.warn('[verifyToken] Supabase getUser error:', error.message, error.name)
      return null
    }
    return data?.user || null
  } catch (err) {
    console.error('[verifyToken] Supabase token verification failed:', err)
    return null
  }
}

async function resolveUserFromSupabase(user) {
  if (!user?.id) return null

  // 1. Try to find by ID (Primary Source of Truth)
  let dbUser = await getUserById(user.id)
  if (dbUser) return dbUser

  const isAnonymous = user.is_anonymous === true

  // 2. Try to find by Email (Fallback/Legacy Sync) — skip for anonymous users
  if (!isAnonymous && user.email) {
    dbUser = await findUserByEmail(user.email)
    if (dbUser) {
      if (dbUser.id !== user.id) {
        console.warn(
          `[verifyToken] ID mismatch — reconciling DB ID ${dbUser.id} → Supabase ID ${user.id} for email ${user.email}`
        )
        try {
          dbUser = await updateUserId(dbUser.id, user.id)
          if (!dbUser) throw new Error('updateUserId returned null')
        } catch (err) {
          console.error(`[verifyToken] ID reconciliation failed: ${err.message}`)
          return null
        }
      }
      return dbUser
    }
  }

  // 3. Create new user with Supabase ID
  try {
    const fullName = isAnonymous
      ? user.user_metadata?.display_name || 'Guest'
      : user.user_metadata?.full_name ||
        user.user_metadata?.fullName ||
        user.user_metadata?.name ||
        user.email
    dbUser = await createUserFromSupabaseProfile({
      id: user.id,
      email: isAnonymous ? null : user.email,
      fullName,
      username: user.user_metadata?.username,
      role: user.user_metadata?.role || 'player',
      city: user.user_metadata?.city,
      gender: user.user_metadata?.gender,
      avatarUrl: isAnonymous
        ? null
        : user.user_metadata?.avatar_url || user.user_metadata?.picture || user.user_metadata?.avatar || null, isAnonymous,
    })
    return dbUser
  } catch (err) {
    console.error('[verifyToken] Failed to create user from Supabase profile:', err.message)
    return null
  }
}

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  
  if (!token) {
    return res.status(401).json({ message: 'Missing authorization header' })
  }

  try {
    const supabaseUser = await getSupabaseUserFromToken(token)
    if (!supabaseUser) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
    
    const appUser = await resolveUserFromSupabase(supabaseUser)
    if (!appUser) {
      return res.status(500).json({ message: 'Unable to sync Supabase user' })
    }
    
    req.authUser = appUser
    req.user = appUser  // For route compatibility
    req.userId = appUser.id
    req.supabaseUser = supabaseUser
    return next()
  } catch (err) {
    console.error('[verifyToken]', err)
    const msg = err?.message || ''
    const isTokenError = /jwt|token|signature|expired|aud|iss/i.test(msg)
    if (isTokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
    return res.status(500).json({
      message: 'Authentication middleware error',
      detail: process.env.NODE_ENV === 'production' ? undefined : msg,
    })
  }
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return next()

  try {
    const supabaseUser = await getSupabaseUserFromToken(token)
    if (supabaseUser) {
      const appUser = await resolveUserFromSupabase(supabaseUser)
      if (appUser) {
        req.authUser = appUser
        req.user = appUser
        req.userId = appUser.id
        req.supabaseUser = supabaseUser
      }
    }
  } catch (err) {
    console.warn('[optionalAuth] Token resolution failed, continuing as anonymous:', err?.message)
  }

  return next()
}

module.exports = { verifyToken, optionalAuth }
