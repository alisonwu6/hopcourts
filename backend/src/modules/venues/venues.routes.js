const express = require('express')
const venuesService = require('./venues.service')
const { verifyToken } = require('../../middleware/verifyToken')

const router = express.Router()

// GET /venues - List venues
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      lat: req.query.lat ? parseFloat(req.query.lat) : undefined,
      lng: req.query.lng ? parseFloat(req.query.lng) : undefined,
      radiusKm: req.query.radiusKm ? parseFloat(req.query.radiusKm) : undefined,
    }
    const venues = await venuesService.listVenues(filters)
    res.json({ success: true, data: venues })
  } catch (err) {
    next(err)
  }
})

// GET /venues/:id - Get single venue details (Entry point for Claim)
router.get('/:id', async (req, res, next) => {
  try {
    const venue = await venuesService.getVenue(req.params.id)
    if (!venue) {
      return res.status(404).json({ success: false, error: 'Venue not found' })
    }
    res.json({ success: true, data: venue })
  } catch (err) {
    next(err)
  }
})

// POST /venues/:id/claim - Request venue claim (Public, no login required)
router.post('/:id/claim', async (req, res, next) => {
  try {
    const claimData = {
      contact_name: req.body.contact_name,
      contact_person: req.body.contact_person,
      contact_title: req.body.contact_title,
      contact_phone: req.body.contact_phone,
      contact_email: req.body.contact_email,
      note: req.body.note
    }
    
    // Optional: if token exists, we can still link it, but it's not required
    // For now, let's keep it clean as per user feedback: "no identity needed"
    const userId = null; 
    
    const claim = await venuesService.requestVenueClaim(req.params.id, userId, claimData)
    res.json({ success: true, data: claim })
  } catch (err) {
    if (err.message === 'Venue already claimed' || err.message === 'Claim already pending') {
      return res.status(400).json({ success: false, error: err.message })
    }
    next(err)
  }
})

// POST /venue-claims/:id/approve - Approve claim (Admin only)
router.post('/venue-claims/:id/approve', verifyToken, async (req, res, next) => {
  try {
    // TODO: Add admin role check here
    const claim = await venuesService.reviewVenueClaim(req.params.id, 'approved')
    res.json({ success: true, data: claim })
  } catch (err) {
    if (err.message === 'Claim not found' || err.message === 'Claim already processed') {
      return res.status(400).json({ success: false, error: err.message })
    }
    next(err)
  }
})

// POST /venue-claims/:id/reject - Reject claim (Admin only)
router.post('/venue-claims/:id/reject', verifyToken, async (req, res, next) => {
  try {
    // TODO: Add admin role check here
    const claim = await venuesService.reviewVenueClaim(req.params.id, 'rejected')
    res.json({ success: true, data: claim })
  } catch (err) {
    if (err.message === 'Claim not found' || err.message === 'Claim already processed') {
      return res.status(400).json({ success: false, error: err.message })
    }
    next(err)
  }
})

module.exports = { venuesRouter: router }
