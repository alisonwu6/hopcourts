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

// POST /admin/venue-claims/:id/revoke - Revoke an approved claim (Audit Reason Required)
router.post('/venue-claims/:id/revoke', async (req, res, next) => {
  try {
    const adminId = req.userId
    const reason = req.body.reason
    
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Audit reason is mandatory and must be at least 5 characters.' 
      })
    }
    
    const result = await venuesService.revokeVenueClaim(req.params.id, adminId, reason.trim())
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
