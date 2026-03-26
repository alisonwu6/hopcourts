'use strict'

const venuesModel = require('../../../models/venues.model')
const sessionsModel = require('../../../models/sessions.model')
const { Errors } = require('../../lib/errors')

async function getMyVenue(userId) {
  const venues = await venuesModel.getManagedVenues(userId)
  if (!venues || venues.length === 0) {
    throw Errors.notFound('No managed venues found')
  }
  const venue = venues[0]
  return {
    venue_id: venue.id,
    venue_name: venue.name_display || venue.name,
    venue_address: venue.address,
  }
}

module.exports = {
  getMyVenue,
}
