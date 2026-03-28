const venuesModel = require('../../../models/venues.model')
const usersModel = require('../../../models/users.model')
const { query } = require('../../lib/db')

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

async function requestVenueClaim(venueId, userId, claimData) {
  const venue = await venuesModel.getVenueById(venueId)
  if (!venue) throw new Error('Venue not found')
  if (venue.status === 'claimed') throw new Error('Venue already claimed')

  // Check if there is already a pending claim for this venue with this email
  const existingClaim = await venuesModel.getPendingClaimByEmail(venueId, claimData.contact_email)
  if (existingClaim) throw new Error('Claim already pending')

  // Check if there's already an approved claim for this venue
  const approvedClaim = await venuesModel.getApprovedClaim(venueId)
  if (approvedClaim) throw new Error('Venue already claimed')

  return venuesModel.createVenueClaim(venueId, userId, claimData)
}

// Check if user is the official owner of a venue
async function isVenueOwner(userId, venueId) {
  const claim = await venuesModel.getApprovedClaimByUser(venueId, userId)
  return !!claim
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

// --- Admin Governance (C0) ---

async function getAdminVenues(filters) {
  return venuesModel.getAdminVenues(filters)
}

async function revokeVenueClaim(claimId, adminId, reason) {
  const result = await venuesModel.revokeVenueClaim(claimId)
  
  // Audit log is mandatory
  await venuesModel.writeAuditLog({
    adminId,
    action: 'revoke_claim',
    targetId: claimId,
    targetType: 'venue_claim',
    note: reason
  })
  
  return result
}

async function patchVenueDisplay(venueId, adminId, data) {
  const result = await venuesModel.patchVenueDisplay(venueId, data)
  
  // Audit log is mandatory
  await venuesModel.writeAuditLog({
    adminId,
    action: 'patch_venue',
    targetId: venueId,
    targetType: 'venue',
    note: `Updated name/address: ${data.name_display || ''}`
  })
  
  return result
}

async function approveVenueClaim(claimId, adminId, officialEmail) {
  // 1. Validate Official Email User Exists (Invite Flow Mock)
  // Use shared model for consistency
  const user = await usersModel.findUserByEmail(officialEmail)
  
  if (!user) {
    throw new Error(`找不到 Email 為 ${officialEmail} 的使用者。請先請對方註冊帳號。`)
  }
  
  const officialUserId = user.id
  
  // 2. Assign Owner to Claim
  // Update the claim to own by the Official User, not the transient applicant
  await query('UPDATE public.venue_claims SET owner_id = $1 WHERE id = $2', [officialUserId, claimId])
  
  // 3. Approve Claim (Standard Flow)
  // This updates claim status and venue status
  const result = await reviewVenueClaim(claimId, 'approved')
  
  // 4. Grant 'venue' role to the official account owner
  // They keep 'player' and gain 'venue': ['player', 'venue']
  await usersModel.addRoleToUser(officialUserId, 'venue')

  // 5. Audit Log
  await venuesModel.writeAuditLog({
    adminId,
    action: 'approve_claim_invite',
    targetId: claimId,
    targetType: 'venue_claim',
    note: `Approved and assigned to official account: ${officialEmail}`
  })
  
  return result
}

module.exports = {
  resolveVenue,
  listVenues,
  getVenue,
  requestVenueClaim,
  reviewVenueClaim,
  isVenueOwner,
  getAdminVenues,
  revokeVenueClaim,
  patchVenueDisplay,
  approveVenueClaim
}
