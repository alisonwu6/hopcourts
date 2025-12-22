const express = require('express')
const {
  handleGetMeProfile,
  handlePutMeProfile,
  handleGetPreferences,
  handlePutPreferences,
  handleGetOnboarding,
  handleGetStats,
} = require('../../modules/profile/profile.controller')

const router = express.Router()

router.get('/me/profile', handleGetMeProfile)
router.put('/me/profile', handlePutMeProfile)
router.get('/me/preferences', handleGetPreferences)
router.put('/me/preferences', handlePutPreferences)
router.get('/me/onboarding', handleGetOnboarding)
router.get('/me/stats', handleGetStats)

module.exports = { profileRouter: router }
