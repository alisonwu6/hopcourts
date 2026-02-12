const express = require('express')
const {
  handleGetMeProfile,
  handlePutMeProfile,
  handleGetPreferences,
  handlePutPreferences,
  handleGetStats,
  handleGetProfileByUsername,
  handleDeleteAccount,
  handleGetTeammates,
} = require('../../modules/profile/profile.controller')

const { verifyToken } = require('../../middleware/verifyToken')

const router = express.Router()

// Public routes
router.get('/profiles/:username', handleGetProfileByUsername)

router.use(verifyToken)

router.get('/me/profile', handleGetMeProfile)
router.put('/me/profile', handlePutMeProfile)
router.patch('/me/profile', handlePutMeProfile)
router.delete('/me/account', handleDeleteAccount)
router.get('/me/preferences', handleGetPreferences)
router.put('/me/preferences', handlePutPreferences)
router.patch('/me/preferences', handlePutPreferences)
router.get('/me/stats', handleGetStats)
router.get('/me/teammates', handleGetTeammates)


module.exports = { profileRouter: router }
