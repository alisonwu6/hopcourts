const express = require('express')
const venuesService = require('../../modules/venues/venues.service')
const { verifyToken } = require('../../middleware/verifyToken')
const { verifyAdmin } = require('../../middleware/verifyAdmin')

const router = express.Router()

// Protection: Authentication AND Admin Role (Hard Guard)
router.use(verifyToken)
router.use(verifyAdmin)

// GET /admin/venues - List all venues for governance
router.get('/venues', async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    }
    const venues = await venuesService.getAdminVenues(filters)
    res.json({ success: true, data: venues })
  } catch (err) {
    next(err)
  }
})

// GET /admin/venue-claims - List all venue claims for review
router.get('/venue-claims', async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    }
    const claims = await venuesService.getAdminClaims(filters)
    res.json({ success: true, data: claims })
  } catch (err) {
    next(err)
  }
})

// POST /admin/venue-claims/:claimId/revoke - Revoke an approved claim (Audit Reason Required)
router.post('/venue-claims/:claimId/revoke', async (req, res, next) => {
  try {
    const adminId = req.userId
    const reason = req.body.reason
    
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Audit reason is mandatory and must be at least 5 characters.' 
      })
    }
    
    const result = await venuesService.revokeVenueClaim(req.params.claimId, adminId, reason.trim())
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// POST /admin/venue-claims/:claimId/approve - Approve claim and assign to official email
router.post('/venue-claims/:claimId/approve', async (req, res, next) => {
  try {
    const adminId = req.userId
    const { officialEmail } = req.body
    
    if (!officialEmail || !officialEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid official email is required.' })
    }
    
    const result = await venuesService.approveVenueClaim(req.params.claimId, adminId, officialEmail)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// PATCH /admin/venues/:venueId - Correction of name or address only
router.patch('/venues/:venueId', async (req, res, next) => {
  try {
    const adminId = req.userId
    const data = {
      name_display: req.body.name_display,
      address_display: req.body.address_display
    }
    const result = await venuesService.patchVenueDisplay(req.params.venueId, adminId, data)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// POST /admin/venues/:venueId/suspend - Suspend venue management access
router.post('/venues/:venueId/suspend', async (req, res, next) => {
  try {
    const adminId = req.userId
    const reason = req.body.reason

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Suspension reason is mandatory and must be at least 5 characters.'
      })
    }

    const result = await venuesService.suspendVenue(req.params.venueId, adminId, reason.trim())
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// POST /admin/venues/:venueId/unsuspend - Restore venue management access
router.post('/venues/:venueId/unsuspend', async (req, res, next) => {
  try {
    const adminId = req.userId
    const result = await venuesService.unsuspendVenue(req.params.venueId, adminId)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

module.exports = { adminRouter: router }
