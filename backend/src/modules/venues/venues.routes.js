const express = require('express')
const venuesService = require('./venues.service')
const { verifyToken } = require('../../middleware/verifyToken')

const router = express.Router()

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return next()
  verifyToken(req, res, next)
}

// GET /venues - List venues
router.get('/', async (req, res, next) => {
  try {
    const VALID_VENUE_TYPES = ['public', 'official', 'private']
    const venueType = VALID_VENUE_TYPES.includes(req.query.type) ? req.query.type : undefined
    const filters = {
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      lat: req.query.lat ? parseFloat(req.query.lat) : undefined,
      lng: req.query.lng ? parseFloat(req.query.lng) : undefined,
      radiusKm: req.query.radiusKm ? parseFloat(req.query.radiusKm) : undefined,
      venueType,
    }
    const venues = await venuesService.listVenues(filters)
    res.json({ success: true, data: venues, has_more: venues.length === filters.limit })
  } catch (err) {
    next(err)
  }
})

// POST /venues/submit - Create public listing or auto-approved official venue
router.post('/submit', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId || req.authUser?.id || req.user?.id || null
    const venue = await venuesService.submitVenue(userId, req.body)
    res.status(201).json({ success: true, data: venue })
  } catch (err) {
    if (
      err.message === 'Authentication required' ||
      err.message === 'User not found' ||
      err.message === 'Invalid venue type' ||
      err.message === 'Venue name is required' ||
      err.message === 'Venue address is required' ||
      err.message === 'Venue coordinates are required' ||
      err.message === 'At least one sport is required' ||
      err.message === 'Invalid ownership role' ||
      err.code === 'INVALID_SPORT'
    ) {
      return res.status(400).json({ success: false, error: err.message })
    }
    next(err)
  }
})

// GET /venues/:id - Get single venue details (Entry point for Claim)
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.userId || req.authUser?.id || req.user?.id || null
    const venue = await venuesService.getVenue(req.params.id, userId)
    if (!venue) {
      return res.status(404).json({ success: false, error: 'Venue not found' })
    }
    res.json({ success: true, data: venue })
  } catch (err) {
    next(err)
  }
})

// POST /venues/:id/claim - Request venue claim (Authenticated)
router.post('/:id/claim', verifyToken, async (req, res, next) => {
  try {
    const claimData = {
      contact_name: req.body.contact_name,
      contact_person: req.body.contact_person,
      contact_title: req.body.contact_title,
      contact_phone: req.body.contact_phone,
      contact_email: req.body.contact_email,
      note: req.body.note
    }
    
    const userId = req.userId || null
    
    const claim = await venuesService.requestVenueClaim(req.params.id, userId, claimData)
    res.json({ success: true, data: claim })
  } catch (err) {
    if (err.message === 'Venue already claimed' || err.message === 'Claim already pending') {
      return res.status(400).json({ success: false, error: err.message })
    }
    next(err)
  }
})

module.exports = { venuesRouter: router }
