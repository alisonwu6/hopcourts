const express = require('express')
const venuesService = require('../../modules/venues/venues.service')
const { verifyToken } = require('../../middleware/verifyToken')

const router = express.Router()

// Protection: Admin role only (Simplified for MVP, usually checks req.user.role)
// For now, we reuse verifyToken to ensure user is logged in
router.use(verifyToken)

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

// POST /admin/venue-claims/:id/revoke - Revoke an approved claim
router.post('/venue-claims/:id/revoke', async (req, res, next) => {
  try {
    const adminId = req.userId
    const reason = req.body.reason || 'No reason provided'
    const result = await venuesService.revokeVenueClaim(req.params.id, adminId, reason)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// PATCH /admin/venues/:id - Correction of name or address only
router.patch('/venues/:id', async (req, res, next) => {
  try {
    const adminId = req.userId
    const data = {
      name_display: req.body.name_display,
      address_display: req.body.address_display
    }
    const result = await venuesService.patchVenueDisplay(req.params.id, adminId, data)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

module.exports = { adminRouter: router }
