const jwt = require('jsonwebtoken')
const {
  findUserById,
  findUserByEmail,
  createUserFromSupabaseProfile,
} = require('../models/userModel')
const supabase = require('../utils/supabase')

const JWT_SECRET = process.env.JWT_SECRET || 'sportsmatch-dev-secret'

async function getSupabaseUserFromToken(token) {
  if (!supabase) return undefined
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error) {
      if (error.status === 401) {
        return null
      }
      console.warn('[verifyToken] Supabase getUser error:', error.message)
      return null
    }
    return data?.user || null
  } catch (err) {
    console.error('[verifyToken] Supabase token verification failed:', err.message)
    return null
  }
}

async function resolveUserFromSupabase(user) {
  if (!user?.email) return null
  let dbUser = await findUserByEmail(user.email)
  if (dbUser) return dbUser
  try {
    dbUser = await createUserFromSupabaseProfile({
      email: user.email,
      fullName:
        user.user_metadata?.full_name ||
        user.user_metadata?.fullName ||
        user.user_metadata?.name ||
        user.email,
      username: user.user_metadata?.username,
      role: user.user_metadata?.role || 'player',
      city: user.user_metadata?.city,
      gender: user.user_metadata?.gender,
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
    if (supabaseUser) {
      const appUser = await resolveUserFromSupabase(supabaseUser)
      if (!appUser) {
        return res.status(500).json({ message: 'Unable to sync Supabase user' })
      }
      req.authUser = appUser
      req.userId = appUser.id
      req.supabaseUser = supabaseUser
      return next()
    }
  } catch (err) {
    console.error('[verifyToken] Supabase verification error:', err.message)
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await findUserById(payload.userId)
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    req.authUser = user
    req.userId = user.id
    return next()
  } catch (error) {
    console.error('Token verification failed', error)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = verifyToken
