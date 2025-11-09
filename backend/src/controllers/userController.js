const { findUserById, findUserByUsername, updateUser } = require('../models/userModel')
const { getPlayerProfile, replacePlayerSports, replacePreferredAreas } = require('../models/playerProfileModel')

function buildProfile(user, extras = {}) {
  if (!user) return null
  const { password_hash, onboarding_status, ...rest } = user
  return { ...rest, ...extras }
}

async function getMyProfile(req, res) {
  try {
    const user = await findUserById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const extras = await getPlayerProfile(req.userId)
    res.json(buildProfile(user, extras))
  } catch (error) {
    console.error('Failed to fetch profile', error)
    res.status(500).json({ message: 'Unable to load profile' })
  }
}

async function updateMyProfile(req, res) {
  try {
    const updates = {
      full_name: req.body.fullName,
      bio: req.body.bio,
      city: req.body.city,
      gender: req.body.gender,
      motivation: req.body.motivation,
    }
    const user = await updateUser(req.userId, updates)
    if (req.body.sports) {
      await replacePlayerSports(req.userId, req.body.sports)
    }
    if (req.body.areas) {
      await replacePreferredAreas(req.userId, req.body.areas)
    }
    const extras = await getPlayerProfile(req.userId)
    res.json(buildProfile(user, extras))
  } catch (error) {
    console.error('Failed to update profile', error)
    res.status(500).json({ message: 'Unable to update profile' })
  }
}

async function getUserProfile(req, res) {
  try {
    const user = await findUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    const extras = await getPlayerProfile(req.params.id)
    res.json(buildProfile(user, extras))
  } catch (error) {
    console.error('Failed to fetch user profile', error)
    res.status(500).json({ message: 'Unable to load profile' })
  }
}

async function checkUsernameAvailability(req, res) {
  try {
    const value = req.query.value
    if (!value) {
      return res.status(400).json({ message: 'Username value is required' })
    }
    const user = await findUserByUsername(value)
    res.json({ available: !user })
  } catch (error) {
    console.error('Failed to check username', error)
    res.status(500).json({ message: 'Unable to check username' })
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  checkUsernameAvailability,
}
