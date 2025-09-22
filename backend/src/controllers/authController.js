require('dotenv').config()
const { signUpUser, confirmUser, loginUser } = require('../utils/cognito')

// POST /api/auth/signup
// body: { username?, email, password }
async function handleSignup(req, res) {
  try {
    const { username, email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }
    const result = await signUpUser({
      username: username || email,
      email,
      password,
    })
    return res.status(200).json({
      message: 'signup OK, check email for code',
      userConfirmed: result.UserConfirmed === true,
    })
  } catch (err) {
    console.error('Signup error:', err)
    return res
      .status(400)
      .json({ error: err.name || 'SignupFailed', details: err.message })
  }
}

// POST /api/auth/confirm
// body: { username, code }
async function handleConfirm(req, res) {
  try {
    const { username, code } = req.body || {}
    if (!username || !code) {
      return res.status(400).json({ error: 'username and code are required' })
    }
    await confirmUser({ username, code })
    return res.status(200).json({ message: 'confirm OK' })
  } catch (err) {
    console.error('Confirm error:', err)
    return res
      .status(400)
      .json({ error: err.name || 'ConfirmFailed', details: err.message })
  }
}

// POST /api/auth/login
// body: { username, password }
async function handleLogin(req, res) {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'username and password are required' })
    }
    const tokens = await loginUser({ username, password })
    if (!tokens || !tokens.accessToken) {
      return res.status(401).json({ error: 'Authentication failed' })
    }
    return res.status(200).json(tokens)
  } catch (err) {
    console.error('Login error:', err)
    return res
      .status(400)
      .json({ error: err.name || 'LoginFailed', details: err.message })
  }
}

module.exports = { handleSignup, handleConfirm, handleLogin }
