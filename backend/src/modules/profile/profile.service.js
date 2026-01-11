const usersModel = require('../../../models/users.model')
const userSportsModel = require('../../../models/userSports.model')
const userPreferencesModel = require('../../../models/userPreferences.model')
const { Errors } = require('../../lib/errors')

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

async function upsertProfile(userId, body = {}) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const user = await usersModel.upsertUser({
    id: userId,
    username: body.username || userId,
    display_name: body.display_name || body.username || 'user',
    legal_name: body.legal_name,
    country_key: body.country_key,
    city_key: body.city_key,
    age_range_key: body.age_range_key,
    vibe_key: body.vibe_key,
    bio: body.bio,
    avatar_url: body.avatar_url,
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

  const sports = await userSportsModel.replaceUserSports(
    userId,
    normalizedSports
  )

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

module.exports = {
  resolveUserId,
  getProfile,
  upsertProfile,
  getPreferences,
  upsertPreferences,
  getOnboardingStatus,
  getStats,
}
