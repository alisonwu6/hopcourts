const express = require('express')
const venuesModel = require('../../../models/venues.model')
const sessionsModel = require('../../../models/sessions.model')
const { verifyToken } = require('../../middleware/verifyToken')
const { ok } = require('../../lib/respond')
const venuePortalService = require('../../modules/venue-portal/venuePortal.service')

const router = express.Router()

// Protection: Authentication required
router.use(verifyToken)

// GET /me - Get the logged-in venue owner's primary venue
router.get('/me', async (req, res, next) => {
  try {
    const data = await venuePortalService.getMyVenue(req.userId)
    return ok(res, data)
  } catch (err) {
    next(err)
  }
})

// GET /me/venues - List all venues managed by the logged-in user
router.get('/me/venues', async (req, res, next) => {
  try {
    const userId = req.userId
    const venues = await venuesModel.getManagedVenues(userId)
    res.json({ success: true, data: venues })
  } catch (err) {
    next(err)
  }
})

// GET /venues/:id/dashboard - Get stats and info for a specific venue
router.get('/venues/:id/dashboard', async (req, res, next) => {
  try {
    const userId = req.userId
    const venueId = req.params.id

    // Authorization: User must have an approved claim for this venue
    const claim = await venuesModel.getApprovedClaimByUser(venueId, userId)
    if (!claim) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You do not manage this venue.' })
    }

    const venue = await venuesModel.getVenueById(venueId)
    
    // In future phases, we will aggregate activity counts here
    res.json({ 
      success: true, 
      data: {
        venue,
        claim_info: claim,
        stats: {
            active_sessions: venue.active_sessions_count || 0
        }
      } 
    })
  } catch (err) {
    next(err)
  }
})

// GET /venues/:id/profile - Get venue profile details
router.get('/venues/:id/profile', async (req, res, next) => {
  try {
    const userId = req.userId
    const venueId = req.params.id

    // Authorization
    const claim = await venuesModel.getApprovedClaimByUser(venueId, userId)
    if (!claim) {
      return res.status(403).json({ success: false, error: 'Unauthorized' })
    }

    const profile = await venuesModel.getVenueProfile(venueId)
    // Return empty object if no profile yet, but wrap in success
    res.json({ success: true, data: profile || {} })
  } catch (err) {
    next(err)
  }
})

// PATCH /venues/:id/profile - Update venue profile
router.patch('/venues/:id/profile', async (req, res, next) => {
  try {
    const userId = req.userId
    const venueId = req.params.id
    
    // Authorization
    const claim = await venuesModel.getApprovedClaimByUser(venueId, userId)
    if (!claim) {
      return res.status(403).json({ success: false, error: 'Unauthorized' })
    }

    const data = {
      logo_url: req.body.logo_url,
      cover_url: req.body.cover_url,
      description: req.body.description,
      social_links: req.body.social_links,
      opening_hours: req.body.opening_hours,
      images: req.body.images
    }

    const result = await venuesModel.upsertVenueProfile(venueId, data)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// POST /venues/:id/sessions - Create Official Session
router.post('/venues/:id/sessions', async (req, res, next) => {
  try {
    const userId = req.userId
    const venueId = req.params.id

    // Authorization: User must manage this venue
    const claim = await venuesModel.getApprovedClaimByUser(venueId, userId)
    if (!claim) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You do not manage this venue.' })
    }

    // Prepare Payload
    const input = {
      ...req.body,
      hostUserId: userId, // Force host to be the logged-in owner
      venueId: venueId,   // Force venue to be the current portal venue
      status: 'published',
      isOfficial: true    // Force Official Flag
    }

    const session = await sessionsModel.createSession(input)
    res.json({ success: true, data: session })

  } catch (err) {
    console.error('Create Session Error:', err)
    res.status(500).json({ success: false, error: err.message, stack: err.stack, details: err })
  }
})

module.exports = { venuePortalRouter: router }
