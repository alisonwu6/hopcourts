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

async function getVenueProfile(venueId) {
  const profile = await venuesModel.getVenueProfile(venueId)
  const amenities = (profile && profile.amenities) || {}
  return {
    logo_url: (profile && profile.logo_url) || null,
    opening_hours: (profile && profile.opening_hours) || [],
    facilities: amenities.facilities || {},
    playing: amenities.playing || {},
    services: amenities.services || {},
    supply: amenities.supply || {},
  }
}

module.exports = {
  getMyVenue,
  getVenueProfile,
}
