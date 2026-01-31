const venuesModel = require('../../../models/venues.model')

// Simple Levenshtein distance for string similarity
function levenshtein(a, b) {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const matrix = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

function isNameSimilar(name1, name2) {
  if (!name1 || !name2) return false
  const n1 = name1.toLowerCase().replace(/\s+/g, '')
  const n2 = name2.toLowerCase().replace(/\s+/g, '')
  if (n1.includes(n2) || n2.includes(n1)) return true
  
  const dist = levenshtein(n1, n2)
  const len = Math.max(n1.length, n2.length)
  const similarity = 1 - dist / len
  return similarity > 0.8 // 80% similarity threshold
}

async function resolveVenue({ lat, lng, name, address, source }) {
  // 1. Search for candidates within 100m
  //    Distance is a NECESSARY but INSUFFICIENT condition.
  const candidates = await venuesModel.findNearbyVenues({ lat, lng, radiusMeters: 100 })
  
  // 2. Evaluate Candidates with STRICT RULES to avoid incorrect merges
  for (const venue of candidates) {
    if (isNameSimilar(venue.name_display, name)) {
      // High confidence match
      // TODO: Check aliases here when implemented
      return venue.id
    }
  }
  
  // 3. No match found -> Create New Venue
  //    Default status is 'unclaimed'. 'source' is tracked in the Event/Session, not the Venue itself.
  const newVenue = await venuesModel.createVenue({
    name,
    lat,
    lng,
    address,
    status: 'unclaimed'
  })
  
  return newVenue.id
}

async function listVenues(params) {
  return venuesModel.listVenues(params)
}

async function getVenue(id) {
  return venuesModel.getVenueById(id)
}

async function requestVenueClaim(venueId, userId) {
  const venue = await venuesModel.getVenueById(venueId)
  if (!venue) throw new Error('Venue not found')
  if (venue.status === 'claimed') throw new Error('Venue already claimed')

  const existingClaim = await venuesModel.getPendingClaim(venueId, userId)
  if (existingClaim) throw new Error('Claim already pending')

  return venuesModel.createVenueClaim(venueId, userId)
}

async function reviewVenueClaim(claimId, status) {
  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('Invalid status')
  }

  const claim = await venuesModel.getVenueClaimById(claimId)
  if (!claim) throw new Error('Claim not found')
  if (claim.status !== 'pending') throw new Error('Claim already processed')

  const updatedClaim = await venuesModel.updateVenueClaimStatus(claimId, status)

  if (status === 'approved') {
    await venuesModel.updateVenueStatus(claim.venue_id, 'claimed')
  }

  return updatedClaim
}

module.exports = {
  resolveVenue,
  listVenues,
  getVenue,
  requestVenueClaim,
  reviewVenueClaim
}
