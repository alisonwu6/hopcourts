const express = require('express')
const router = express.Router()
const {
  handleSignup,
  handleConfirm,
  handleLogin,
} = require('../controllers/authController')

router.post('/signup', handleSignup)
router.post('/confirm', handleConfirm)
router.post('/login', handleLogin)

module.exports = router
