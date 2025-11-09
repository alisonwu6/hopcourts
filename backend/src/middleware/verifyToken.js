const jwt = require('jsonwebtoken')
const { findUserById } = require('../models/userModel')

const JWT_SECRET = process.env.JWT_SECRET || 'sportsmatch-dev-secret'

async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      return res.status(401).json({ message: 'Missing authorization header' })
    }

    const payload = jwt.verify(token, JWT_SECRET)
    const user = await findUserById(payload.userId)
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    req.authUser = user
    req.userId = user.id
    next()
  } catch (error) {
    console.error('Token verification failed', error)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = verifyToken
