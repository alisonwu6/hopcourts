const { updateUser } = require('../models/userModel')
const { replacePlayerSports, replacePreferredAreas } = require('../models/playerProfileModel')
const { createVenue, replaceVenueSports, updateVenue, getVenueById } = require('../models/venueModel')
const { getOnboardingStatus, saveOnboardingStatus } = require('../models/onboardingModel')

async function getPlayerProgress(req, res) {
  try {
    const status = await getOnboardingStatus(req.userId)
    res.json(status)
  } catch (error) {
    console.error('Failed to fetch onboarding status', error)
    res.status(500).json({ message: 'Unable to load onboarding status' })
  }
}

async function handlePlayerStep(req, res) {
  const step = req.params.step
  try {
    let patch = {}
    switch (step) {
      case 'role':
        patch = { hasRole: true }
        if (req.body?.role) {
          await updateUser(req.userId, { role: req.body.role })
        }
        break
      case 'basic-info':
        await updateUser(req.userId, {
          full_name: req.body.fullName,
          city: req.body.city,
          gender: req.body.gender,
        })
        patch = { hasBasicInfo: true }
        break
      case 'username':
        await updateUser(req.userId, { username: req.body.username })
        patch = { hasUsername: true }
        break
      case 'sports':
        await replacePlayerSports(req.userId, req.body.sports || [])
        patch = { hasSports: true, hasSkillLevels: true }
        break
      case 'style':
        await updateUser(req.userId, { bio: req.body.playingStyle })
        patch = { hasPlayingStyle: true }
        break
      case 'areas':
        await replacePreferredAreas(req.userId, req.body.areas || [])
        patch = { hasPreferredAreas: true }
        break
      case 'frequency':
        patch = { hasPlayFrequency: true }
        break
      case 'avatar':
        await updateUser(req.userId, { avatar_url: req.body.avatarUrl })
        patch = { hasAvatar: true }
        break
      case 'motivation':
        await updateUser(req.userId, { motivation: req.body.motivation })
        patch = { hasMotivation: true }
        break
      default:
        return res.status(400).json({ message: 'Unknown onboarding step' })
    }

    const status = await saveOnboardingStatus(req.userId, patch)
    res.json(status)
  } catch (error) {
    console.error('Failed to persist onboarding step', error)
    res.status(500).json({ message: 'Unable to save onboarding step' })
  }
}

async function handleVenueStep(req, res) {
  const step = req.params.step
  try {
    let responseExtras = {}
    let patch = {}
    switch (step) {
      case 'details':
        req.body.managerId = req.userId
        if (req.body.venueId) {
          await updateVenue(req.body.venueId, req.body)
          responseExtras.venueId = req.body.venueId
        } else {
          const venueId = await createVenue({
            managerId: req.userId,
            ...req.body,
          })
          req.body.venueId = venueId
          responseExtras.venueId = venueId
        }
        patch = { hasVenueDetails: true }
        break
      case 'sports':
        if (!req.body.venueId) {
          return res.status(400).json({ message: 'venueId is required' })
        }
        await replaceVenueSports(req.body.venueId, req.body.sports || [])
        patch = { hasVenueSports: true }
        responseExtras.venueId = req.body.venueId
        break
      case 'courts':
        patch = { hasVenueCourts: true }
        responseExtras.venueId = req.body.venueId
        break
      case 'photo':
        if (req.body.venueId && req.body.photoUrl) {
          await updateVenue(req.body.venueId, { photo_url: req.body.photoUrl })
        }
        patch = { hasVenuePhoto: true }
        responseExtras.venueId = req.body.venueId
        break
      case 'verify':
        patch = { hasVenueVerification: true }
        responseExtras.venueId = req.body.venueId
        break
      default:
        return res.status(400).json({ message: 'Unknown venue onboarding step' })
    }

    const status = await saveOnboardingStatus(req.userId, patch)
    res.json({ status, ...responseExtras })
  } catch (error) {
    console.error('Failed to persist venue onboarding step', error)
    res.status(500).json({ message: 'Unable to save onboarding step' })
  }
}

async function verifyVenueToken(req, res) {
  // Simplified placeholder verification
  res.json({ verified: true, token: req.params.token })
}

async function completePlayerOnboarding(req, res) {
  try {
    const { fullName, city, gender, username, sports, areas, motivation } = req.body || {}

    if (fullName || city || gender) {
      await updateUser(req.userId, {
        full_name: fullName,
        city,
        gender,
      })
    }

    if (username) {
      await updateUser(req.userId, { username })
    }

    if (Array.isArray(sports)) {
      await replacePlayerSports(req.userId, sports)
    }

    if (Array.isArray(areas)) {
      await replacePreferredAreas(req.userId, areas)
    }

    if (motivation) {
      await updateUser(req.userId, { motivation })
    }

    const status = await saveOnboardingStatus(req.userId, {
      hasRole: true,
      hasBasicInfo: Boolean(fullName || city),
      hasUsername: Boolean(username),
      hasSports: Array.isArray(sports) && sports.length > 0,
      hasSkillLevels: Array.isArray(sports) && sports.length > 0,
      hasPreferredAreas: Array.isArray(areas) && areas.length > 0,
      hasMotivation: Boolean(motivation),
      isComplete: true,
    })

    res.json(status)
  } catch (error) {
    console.error('Failed to complete onboarding', error)
    res.status(500).json({ message: 'Unable to complete onboarding' })
  }
}

module.exports = {
  getPlayerProgress,
  handlePlayerStep,
  handleVenueStep,
  verifyVenueToken,
  completePlayerOnboarding,
}
