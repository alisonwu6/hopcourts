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

router.get('/me/profile', verifyToken, handleGetMeProfile)
router.put('/me/profile', verifyToken, handlePutMeProfile)
router.patch('/me/profile', verifyToken, handlePutMeProfile)
router.delete('/me/account', verifyToken, handleDeleteAccount)
router.get('/me/preferences', verifyToken, handleGetPreferences)
router.put('/me/preferences', verifyToken, handlePutPreferences)
router.patch('/me/preferences', verifyToken, handlePutPreferences)
router.get('/me/stats', verifyToken, handleGetStats)
router.get('/me/teammates', verifyToken, handleGetTeammates)


module.exports = { profileRouter: router }
