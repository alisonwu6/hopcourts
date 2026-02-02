const usersModel = require('../../../models/users.model')
const userSportsModel = require('../../../models/userSports.model')
const userPreferencesModel = require('../../../models/userPreferences.model')
const { Errors } = require('../../lib/errors')
const supabase = require('../../utils/supabase')

function resolveUserId(req) {
  return (
    req.userId ||
    req.authUser?.id ||
    req.user?.id ||
    req.headers['x-user-id'] ||
    req.headers['x-userid']
  )
}

async function getProfile(userId) {
  const user = await usersModel.getUserById(userId)
  if (!user) throw Errors.notFound('User not found')
  const sports = await userSportsModel.listUserSports(userId)
  return {
    user,
    sports,
  }
}

async function getProfileByUsername(username) {
  const user = await usersModel.getUserByUsername(username)
  if (!user) throw Errors.notFound('User not found')
  const sports = await userSportsModel.listUserSports(user.id)
  return { user, sports }
}

async function upsertProfile(userId, body = {}) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const current = (await usersModel.getUserById(userId)) || {}

  // Enforce single username update rule
  if (body.username && current.username && body.username !== current.username) {
    if (current.username_updated_count >= 1) {
      throw Errors.badRequest('使用者名稱只能修改一次')
    }
  }

  const user = await usersModel.upsertUser({
    id: userId,
    username: body.username || current.username || null,
    display_name:
      body.display_name ||
      current.display_name ||
      '新夥伴',
    legal_name: body.legal_name ?? current.legal_name ?? null,
    country_key: body.country_key ?? current.country_key ?? null,
    city_key: body.city_key ?? current.city_key ?? null,
    age_range_key: body.age_range_key ?? current.age_range_key ?? null,
    gender: body.gender ?? current.gender ?? null,
    vibe_key: body.vibe_key ?? current.vibe_key ?? null,
    bio: body.bio ?? current.bio ?? null,
    avatar_url:
      body.avatar_url ||
      body.avatar ||
      current.avatar_url ||
      (body.auth_user && body.auth_user.avatar_url) ||
      (body.auth_user && body.auth_user.user_metadata && body.auth_user.user_metadata.picture) ||
      null,
  })

  const sportsInput = Array.isArray(body.sports) ? body.sports : []
  const favSports = Array.isArray(body.favorite_sports) ? body.favorite_sports : []
  const tryingSports = Array.isArray(body.trying_sports) ? body.trying_sports : []
  const normalizedSports = [
    ...sportsInput.map((s) => ({
      sport_key: s.sport_key || s.sportKey || s.key,
      kind: s.kind || s.type || 'FAVORITE',
    })),
    ...favSports.map((key) => ({ sport_key: key, kind: 'FAVORITE' })),
    ...tryingSports.map((key) => ({ sport_key: key, kind: 'TRYING' })),
  ].filter((s) => s.sport_key)

  let sports
  if (normalizedSports.length > 0) {
    sports = await userSportsModel.replaceUserSports(userId, normalizedSports)
  } else {
    // 沒有提供運動相關欄位時，不要清空既有運動設定
    sports = await userSportsModel.listUserSports(userId)
  }

  return { user, sports }
}

async function getPreferences(userId) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const prefs = await userPreferencesModel.getPreferences(userId)
  return prefs || {}
}

async function upsertPreferences(userId, body = {}) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const prefs = await userPreferencesModel.upsertPreferences(userId, {
    preferred_time: body.preferred_time || body.preferredTime || null,
    sessions_per_week: body.sessions_per_week ?? body.sessionsPerWeek ?? null,
    day_slots: body.day_slots || body.daySlots || null,
  })
  const favSports = Array.isArray(body.favorite_sports) ? body.favorite_sports : []
  const tryingSports = Array.isArray(body.trying_sports) ? body.trying_sports : []
  const sportsPayload = [
    ...favSports.map((key) => ({ sport_key: key, kind: 'FAVORITE' })),
    ...tryingSports.map((key) => ({ sport_key: key, kind: 'TRYING' })),
  ]
  if (sportsPayload.length) {
    await userSportsModel.replaceUserSports(userId, sportsPayload)
  }
  return prefs
}

async function getOnboardingStatus(userId) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const user = await usersModel.getUserById(userId)
  const missing = []
  if (!user?.display_name) missing.push('display_name')
  if (!user?.country_key) missing.push('country_key')
  if (!user?.city_key) missing.push('city_key')
  if (!user?.vibe_key) missing.push('vibe_key')
  if (!user?.age_range_key) missing.push('age_range_key')
  const sports = await userSportsModel.listUserSports(userId)
  if (!sports.length) missing.push('sports')
  return { is_complete: missing.length === 0, missing_fields: missing }
}

async function getStats(userId) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  // Placeholder stats
  return {
    sessions_joined: 0,
    sessions_completed: 0,
    high_fives_given: 0,
    high_fives_received: 0,
  }
}

async function deleteAccount(userId) {
  if (!userId) throw Errors.unauthenticated('User id is required')

  // Attempt to delete from Supabase Auth
  if (supabase) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) {
        console.warn(`[deleteAccount] Supabase Auth delete failed for ${userId}:`, error.message)
      } else {
        console.log(`[deleteAccount] Deleted user ${userId} from Supabase Auth`)
      }
    } catch (err) {
      console.error('[deleteAccount] Supabase Auth error:', err)
    }
  }

  // Delete from local DB (CASCADE should handle related tables)
  const success = await usersModel.deleteUser(userId)
  return { success }
}

module.exports = {
  resolveUserId,
  getProfile,
  getProfileByUsername,
  upsertProfile,
  getPreferences,
  upsertPreferences,
  getOnboardingStatus,
  getStats,
  deleteAccount,
}
