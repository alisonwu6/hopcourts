const {
  resolveUserId,
  getProfile,
  upsertProfile,
  getPreferences,
  upsertPreferences,
  getOnboardingStatus,
  getStats,
} = require('./profile.service')
const { ok } = require('../../lib/respond')

async function handleGetMeProfile(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const data = await getProfile(userId)
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handlePutMeProfile(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const data = await upsertProfile(userId, req.body || {})
    return ok(res, data)
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

module.exports = {
  handleGetMeProfile,
  handlePutMeProfile,
  handleGetPreferences,
  handlePutPreferences,
  handleGetOnboarding,
  handleGetStats,
}
