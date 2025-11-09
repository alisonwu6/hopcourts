const { getVenueById, listVenues } = require('../models/venueModel')

async function handleGetVenue(req, res) {
  try {
    const venue = await getVenueById(req.params.id)
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' })
    }
    res.json(venue)
  } catch (error) {
    console.error('Failed to fetch venue', error)
    res.status(500).json({ message: 'Unable to load venue' })
  }
}

async function handleListVenues(_req, res) {
  try {
    const venues = await listVenues()
    res.json({ data: venues })
  } catch (error) {
    console.error('Failed to list venues', error)
    res.status(500).json({ message: 'Unable to load venues' })
  }
}

module.exports = {
  handleGetVenue,
  handleListVenues,
}
