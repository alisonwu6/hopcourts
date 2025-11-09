const express = require('express')
const router = express.Router()
const {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  checkUsernameAvailability,
} = require('../controllers/userController')
const verifyToken = require('../middleware/verifyToken')

router.get('/me', verifyToken, getMyProfile)
router.put('/me', verifyToken, updateMyProfile)
router.get('/check/username', checkUsernameAvailability)
router.get('/:id', getUserProfile)

module.exports = router
