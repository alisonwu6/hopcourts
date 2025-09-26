const express = require('express')
const router = express.Router()
const {
  handleSignup,
  handleConfirm,
  handleLogin,
  handleGetSecret,
} = require('../controllers/authController')

router.post('/signup', handleSignup)
router.post('/confirm', handleConfirm)
router.post('/login', handleLogin)
router.get('/secret-test', handleGetSecret)

module.exports = router
