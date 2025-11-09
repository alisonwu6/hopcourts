const jwt = require('jsonwebtoken')
const { createUser, findUserByEmail, findUserById, verifyPassword } = require('../models/userModel')
const { DEFAULT_STATUS, saveOnboardingStatus } = require('../models/onboardingModel')

const JWT_SECRET = process.env.JWT_SECRET || 'sportsmatch-dev-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h'

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

function serializeUser(user) {
  if (!user) return null
  const { password_hash, onboarding_status, ...rest } = user
  return rest
}

async function handleSignup(req, res) {
  try {
    const { name, email, password, role = 'player', city, gender, username } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const userId = await createUser({
      fullName: name,
      email,
      password,
      username,
      role,
      city,
      gender,
    })

    const user = await findUserById(userId)
    await saveOnboardingStatus(userId, DEFAULT_STATUS)
    const token = generateToken(user)
    return res.status(201).json({
      token,
      user: serializeUser(user),
      onboardingStatus: DEFAULT_STATUS,
    })
  } catch (error) {
    console.error('Signup error', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email or username already registered' })
    }
    res.status(500).json({ message: 'Signup failed', error: error.message })
  }
}

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const status = await saveOnboardingStatus(user.id, {})
    const token = generateToken(user)
    return res.json({
      token,
      user: serializeUser(user),
      onboardingStatus: status,
    })
  } catch (error) {
    console.error('Login error', error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
}

async function handleLogout(_req, res) {
  res.json({ success: true })
}

module.exports = {
  handleSignup,
  handleLogin,
  handleLogout,
}
