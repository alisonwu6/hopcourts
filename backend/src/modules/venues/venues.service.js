const venuesModel = require('../../../models/venues.model')
const usersModel = require('../../../models/users.model')
const { query } = require('../../lib/db')
const { geocodeAddress } = require('../../utils/geocoding')

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
  const candidates = await venuesModel.findNearbyVenues({ lat, lng, radiusMeters: 100 })

  // 2a. Single candidate within radius → high-confidence coordinate match, use it
  if (candidates.length === 1) {
    return candidates[0].id
  }

  // 2b. Multiple candidates → use name similarity to disambiguate
  for (const venue of candidates) {
    if (isNameSimilar(venue.name_display, name)) {
      return venue.id
    }
  }

  // 3. No candidates at all → create new venue
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

async function getVenue(id, userId = null) {
  return venuesModel.getVenueById(id, userId)
}

const OWNERSHIP_ROLES = new Set(['owner', 'manager', 'official_representative', 'community_organizer'])

function normalizeSubmitVenuePayload(body = {}) {
  const venueType = String(body.venue_type || '').trim()
  const name = String(body.name || '').trim()
  const address = String(body.address || '').trim()
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  const sportKeys = Array.isArray(body.sport_keys)
    ? body.sport_keys.map((key) => String(key || '').trim().toUpperCase()).filter(Boolean)
    : []
  const ownershipRole = body.ownership_role ? String(body.ownership_role).trim() : ''
  const contactPerson = body.contact_person ? String(body.contact_person).trim() : ''
  const contactPhone = body.contact_phone ? String(body.contact_phone).trim() : ''
  const contactEmail = body.contact_email ? String(body.contact_email).trim() : ''
  const note = body.note ? String(body.note).trim() : ''

  if (!['public', 'official'].includes(venueType)) {
    throw new Error('Invalid venue type')
  }
  if (!name) throw new Error('Venue name is required')
  if (!address) throw new Error('Venue address is required')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Venue coordinates are required')
  if (!sportKeys.length) throw new Error('At least one sport is required')
  if (venueType === 'official' && !OWNERSHIP_ROLES.has(ownershipRole)) {
    throw new Error('Invalid ownership role')
  }
  if (venueType === 'official' && !contactPerson) throw new Error('Contact person is required')
  if (venueType === 'official' && !contactPhone) throw new Error('Contact phone is required')
  if (venueType === 'official' && !contactEmail) throw new Error('Contact email is required')

  return {
    venueType,
    name,
    address,
    lat,
    lng,
    sportKeys,
    ownershipRole: venueType === 'official' ? ownershipRole : null,
    contactPerson: venueType === 'official' ? contactPerson : null,
    contactPhone: venueType === 'official' ? contactPhone : null,
    contactEmail: venueType === 'official' ? contactEmail : null,
    note: venueType === 'official' ? note : null,
  }
}

async function submitVenue(userId, body) {
  if (!userId) throw new Error('Authentication required')

  const payload = normalizeSubmitVenuePayload(body)
  const user = await usersModel.getUserById(userId)
  if (!user) throw new Error('User not found')

  const result = await venuesModel.submitVenue({
    ...payload,
    userId,
    contactName: payload.contactPerson || user.display_name || user.username || user.email || null,
    contactEmail: payload.contactEmail || user.email || null,
    contactPhone: payload.contactPhone || null,
  })

  return {
    venue_id: result.venue.id,
    name_display: result.venue.name_display || result.venue.name,
    venue_type: result.venue.venue_type,
    status: result.venue.status,
    trial_ends_at: result.venue.trial_ends_at,
  }
}

async function requestVenueClaim(venueId, userId, claimData) {
  const venue = await venuesModel.getVenueById(venueId)
  if (!venue) throw new Error('Venue not found')
  if (venue.status === 'claimed') throw new Error('Venue already claimed')

  const normalizedClaim = {
    contact_name: String(claimData?.contact_name || '').trim(),
    contact_person: String(claimData?.contact_person || '').trim(),
    contact_title: String(claimData?.contact_title || '').trim(),
    contact_phone: String(claimData?.contact_phone || '').trim(),
    contact_email: String(claimData?.contact_email || '').trim(),
    note: claimData?.note ? String(claimData.note).trim() : undefined,
  }

  if (userId) {
    const user = await usersModel.getUserById(userId)
    const fallbackName = String(user?.display_name || '').trim()
    const fallbackEmail = String(user?.email || '').trim()

    if (!normalizedClaim.contact_name && fallbackName) {
      normalizedClaim.contact_name = fallbackName
    }
    if (!normalizedClaim.contact_email && fallbackEmail) {
      normalizedClaim.contact_email = fallbackEmail
    }
  }

  if (!normalizedClaim.contact_person && normalizedClaim.contact_name) {
    normalizedClaim.contact_person = normalizedClaim.contact_name
  }

  if (!normalizedClaim.contact_name || !normalizedClaim.contact_person || !normalizedClaim.contact_title || !normalizedClaim.contact_phone || !normalizedClaim.contact_email) {
    throw new Error('Claim form is incomplete')
  }

  // Check if there is already a pending claim for this venue with this email
  const existingClaim = await venuesModel.getPendingClaimByEmail(venueId, normalizedClaim.contact_email)
  if (existingClaim) throw new Error('Claim already pending')

  // Check if there's already an approved claim for this venue
  const approvedClaim = await venuesModel.getApprovedClaim(venueId)
  if (approvedClaim) throw new Error('Venue already claimed')

  // Single atomic transaction: claim record + venue activation + user role
  const activated = await venuesModel.activateVenueClaim(venueId, userId, normalizedClaim)

  return {
    venue_id: activated.id,
    name_display: activated.name_display || activated.name,
    trial_ends_at: activated.trial_ends_at,
  }
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
    await venuesModel.updateVenueType(claim.venue_id, 'official')
    await venuesModel.startVenueTrial(claim.venue_id)
  }

  return updatedClaim
}

// --- Admin Governance (C0) ---

async function getAdminVenues(filters) {
  return venuesModel.getAdminVenues(filters)
}

async function getAdminClaims(filters) {
  return venuesModel.getAdminClaims(filters)
}

async function rejectVenueClaim(claimId, adminId, reason) {
  const result = await reviewVenueClaim(claimId, 'rejected')

  await venuesModel.writeAuditLog({
    adminId,
    action: 'reject_claim',
    targetId: claimId,
    targetType: 'venue_claim',
    note: reason,
  })

  return result
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
  const patchData = { ...data }

  const nextAddress = typeof data.address_display === 'string' ? data.address_display.trim() : ''
  if (nextAddress) {
    const geocoded = await geocodeAddress(nextAddress)
    if (!geocoded) {
      throw new Error('Unable to geocode venue address. Check MAPBOX_TOKEN and address format.')
    }

    patchData.lat = geocoded.lat
    patchData.lng = geocoded.lng
  }

  const result = await venuesModel.patchVenueDisplay(venueId, patchData)
  
  // Audit log is mandatory
  await venuesModel.writeAuditLog({
    adminId,
    action: 'patch_venue',
    targetId: venueId,
    targetType: 'venue',
    note: `Updated display/operator fields: ${[
      data.name_display ? 'name' : null,
      data.address_display ? 'address' : null,
      data.operator_name !== undefined ? 'operator_name' : null,
      data.operator_email !== undefined ? 'operator_email' : null,
      data.operator_role !== undefined ? 'operator_role' : null,
      data.operator_phone !== undefined ? 'operator_phone' : null,
      patchData.lat !== undefined && patchData.lng !== undefined ? 'lat_lng' : null,
    ].filter(Boolean).join(', ')}`
  })
  
  return result
}

async function suspendVenue(venueId, adminId, reason) {
  const result = await venuesModel.suspendVenue(venueId)

  await venuesModel.writeAuditLog({
    adminId,
    action: 'suspend_venue',
    targetId: venueId,
    targetType: 'venue',
    note: reason,
  })

  return result
}

async function unsuspendVenue(venueId, adminId) {
  const result = await venuesModel.unsuspendVenue(venueId)

  await venuesModel.writeAuditLog({
    adminId,
    action: 'unsuspend_venue',
    targetId: venueId,
    targetType: 'venue',
    note: 'Venue access restored by admin',
  })

  return result
}

async function approveVenueClaim(claimId, adminId, officialEmail) {
  const claim = await venuesModel.getVenueClaimById(claimId)
  if (!claim) {
    throw new Error('Claim not found')
  }

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

  // 3.1 Re-geocode official venue address on approval to avoid stale coordinates
  // from older player-originated venue records.
  const venue = await venuesModel.getVenueById(claim.venue_id)
  const venueAddress = String(venue?.address || '').trim()
  if (venueAddress) {
    const geocoded = await geocodeAddress(venueAddress)
    if (!geocoded) {
      throw new Error('Unable to geocode venue address during claim approval. Check MAPBOX_TOKEN and address format.')
    }

    await venuesModel.patchVenueDisplay(claim.venue_id, {
      lat: geocoded.lat,
      lng: geocoded.lng,
    })
  }
  
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

async function joinOfficialWaitlist({ email, userId }) {
  await query(
    `INSERT INTO venue_official_waitlist (email, user_id) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET user_id = COALESCE(venue_official_waitlist.user_id, EXCLUDED.user_id)`,
    [email, userId]
  )
}

module.exports = {
  resolveVenue,
  listVenues,
  getVenue,
  submitVenue,
  requestVenueClaim,
  reviewVenueClaim,
  isVenueOwner,
  getAdminVenues,
  getAdminClaims,
  rejectVenueClaim,
  revokeVenueClaim,
  patchVenueDisplay,
  suspendVenue,
  unsuspendVenue,
  approveVenueClaim,
  joinOfficialWaitlist,
}
