const express = require('express')
const {
  handleGetMeProfile,
  handlePutMeProfile,
  handleGetPreferences,
  handlePutPreferences,
  handleGetStats,
  handleGetProfileByUsername,
  handleDeleteAccount,
} = require('../../modules/profile/profile.controller')

const router = express.Router()

router.get('/me/profile', handleGetMeProfile)
router.put('/me/profile', handlePutMeProfile)
router.patch('/me/profile', handlePutMeProfile)
router.delete('/me/account', handleDeleteAccount)
router.get('/me/preferences', handleGetPreferences)
router.put('/me/preferences', handlePutPreferences)
router.patch('/me/preferences', handlePutPreferences)
router.get('/me/stats', handleGetStats)
router.get('/profiles/:username', handleGetProfileByUsername)

module.exports = { profileRouter: router }
