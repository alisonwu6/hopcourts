const {
  resolveUserId,
  getProfile,
  getProfileByUsername,
  getProfileSessionsByUsername,
  upsertProfile,
  getPreferences,
  upsertPreferences,
  getOnboardingStatus,
  getStats,
  deleteAccount,
  getTeammates,
} = require('./profile.service')
const { ok } = require('../../lib/respond')
const { mapUserProfile } = require('./profile.mapper')

function parseNumber(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

async function handleGetMeProfile(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const data = await getProfile(userId)
    return ok(res, mapUserProfile(data))
  } catch (err) {
    next(err)
  }
}

async function handlePutMeProfile(req, res, next) {
  try {
    console.log('[handlePutMeProfile] Request body:', req.body)
    const userId = resolveUserId(req)
    console.log('[handlePutMeProfile] UserId:', userId)
    await upsertProfile(userId, { ...req.body, auth_user: req.authUser })
    const fullProfile = await getProfile(userId)
    return ok(res, mapUserProfile(fullProfile))
  } catch (err) {
    next(err)
  }
}

async function handleGetPreferences(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const data = await getPreferences(userId)
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handlePutPreferences(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const data = await upsertPreferences(userId, req.body || {})
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleGetOnboarding(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const data = await getOnboardingStatus(userId)
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleGetStats(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const data = await getStats(userId)
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleGetProfileByUsername(req, res, next) {
  try {
    const { username } = req.params
    const data = await getProfileByUsername(username)
    return ok(res, mapUserProfile(data))
  } catch (err) {
    next(err)
  }
}

async function handleGetProfileSessionsByUsername(req, res, next) {
  try {
    const { username } = req.params
    const role = req.query.role ? String(req.query.role) : undefined
    const time = req.query.time ? String(req.query.time) : undefined
    const limit = Math.min(Math.max(parseNumber(req.query.limit, 20), 1), 50)
    const offset = Math.max(parseNumber(req.query.offset, 0), 0)
    const data = await getProfileSessionsByUsername(username, { role, time, limit, offset })
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleDeleteAccount(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const force = req.body?.force === true
    await deleteAccount(userId, { force })
    return ok(res, { success: true })
  } catch (err) {
    next(err)
  }
}

async function handleGetTeammates(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const limit = Math.min(Math.max(parseNumber(req.query.limit, 30), 1), 100)
    const offset = Math.max(parseNumber(req.query.offset, 0), 0)
    const data = await getTeammates(userId, { limit, offset })
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  handleGetMeProfile,
  handleGetProfileByUsername,
  handleGetProfileSessionsByUsername,
  handlePutMeProfile,
  handleGetPreferences,
  handlePutPreferences,
  handleGetOnboarding,
  handleGetStats,
  handleDeleteAccount,
  handleGetTeammates,
}
