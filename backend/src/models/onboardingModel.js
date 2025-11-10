const waitForDB = require('../utils/db')

const DEFAULT_STATUS = {
  hasRole: false,
  hasBasicInfo: false,
  hasUsername: false,
  hasSports: false,
  hasSkillLevels: false,
  hasPlayingStyle: false,
  hasPreferredAreas: false,
  hasPlayFrequency: false,
  hasAvatar: false,
  hasMotivation: false,
  hasVenueDetails: false,
  hasVenueSports: false,
  hasVenueCourts: false,
  hasVenuePhoto: false,
  hasVenueVerification: false,
  isComplete: false,
}

async function getOnboardingStatus(userId) {
  const db = await waitForDB()
  const res = await db.query('SELECT onboarding_status FROM users WHERE id = $1', [userId])
  if (!res.rows[0]) return DEFAULT_STATUS
  const status = res.rows[0].onboarding_status
  const parsed = !status
    ? {}
    : typeof status === 'string'
      ? JSON.parse(status)
      : status
  return { ...DEFAULT_STATUS, ...parsed }
}

async function saveOnboardingStatus(userId, partialStatus) {
  const current = await getOnboardingStatus(userId)
  const merged = { ...current, ...partialStatus }
  const db = await waitForDB()
  await db.query('UPDATE users SET onboarding_status = $1 WHERE id = $2', [
    JSON.stringify(merged),
    userId,
  ])
  return merged
}

module.exports = {
  getOnboardingStatus,
  saveOnboardingStatus,
  DEFAULT_STATUS,
}
