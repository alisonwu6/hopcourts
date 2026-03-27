'use strict'

const venuesModel = require('../../models/venues.model')

async function verifyVenueOwner(req, res, next) {
  try {
    const venueId = req.params.id
    const userId = req.userId

    if (!venueId) {
      return res.status(400).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Venue ID is required' } })
    }

    const claim = await venuesModel.getApprovedClaimByUser(venueId, userId)
    if (!claim) {
      return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'You do not manage this venue' } })
    }

    req.venueClaim = claim
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { verifyVenueOwner }
