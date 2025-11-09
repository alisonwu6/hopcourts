const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const {
  getPlayerProgress,
  handlePlayerStep,
  handleVenueStep,
  verifyVenueToken,
  completePlayerOnboarding,
} = require('../controllers/onboardingController')

router.get('/player/progress', verifyToken, getPlayerProgress)
router.post('/player/:step', verifyToken, handlePlayerStep)
router.post('/player/complete', verifyToken, completePlayerOnboarding)
router.post('/venue/:step', verifyToken, handleVenueStep)
router.get('/venue/verify/:token', verifyVenueToken)

module.exports = router
