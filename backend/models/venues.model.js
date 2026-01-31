const { query } = require('../db/client')

async function createVenue(input) {
  const sql = `
    INSERT INTO public.venues (
      name_display,
      address_display,
      lat,
      lng,
      status
    ) VALUES (
      $1, $2, $3, $4, $5
    )
    RETURNING *
  `
  const params = [
    input.name,
    input.address,
    input.lat,
    input.lng,
    input.status ?? 'unclaimed' // 'unclaimed' | 'claimed'
  ]
  const { rows } = await query(sql, params)
  return rows[0]
}

async function findNearbyVenues({ lat, lng, radiusMeters = 100 }) {
  // Simple bounding box for MVP
  // 1 deg lat ~= 111km -> 1m ~= 1/111000 deg
  const latDelta = radiusMeters / 111320
  // Adjust lng delta based on latitude
  const lngDelta = radiusMeters / (40008000 / 360 * Math.cos(lat * Math.PI / 180))

  const sql = `
    SELECT * FROM public.venues
    WHERE lat BETWEEN $1 AND $2
      AND lng BETWEEN $3 AND $4
  `
  const params = [
    lat - latDelta, lat + latDelta,
    lng - Math.abs(lngDelta), lng + Math.abs(lngDelta)
  ]
  
  const { rows } = await query(sql, params)
  return rows
}

async function getVenueById(id) {
  const sql = `
    SELECT v.*,
      (SELECT COUNT(*)::int FROM public.sessions s 
       WHERE s.venue_id = v.id 
         AND s.ends_at > NOW() 
         AND s.status = 'published') as active_sessions_count
    FROM public.venues v
    WHERE v.id = $1
  `
  const { rows } = await query(sql, [id])
  return rows[0]
}

async function listVenues({ limit = 50, offset = 0, lat, lng, radiusKm } = {}) {
  let conditions = []
  let params = []
  
  // Basic geo filtering if provided
  if (lat && lng && radiusKm) {
    const latDelta = (radiusKm * 1000) / 111320
    const lngDelta = (radiusKm * 1000) / (40008000 / 360 * Math.cos(lat * Math.PI / 180))
    
    conditions.push(`lat BETWEEN $${params.length + 1} AND $${params.length + 2}`)
    params.push(lat - latDelta, lat + latDelta)
    
    conditions.push(`lng BETWEEN $${params.length + 1} AND $${params.length + 2}`)
    params.push(lng - Math.abs(lngDelta), lng + Math.abs(lngDelta))
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  
  // Note: Using subquery for counts is simpler for now than GROUP BY everything
  const sql = `
    SELECT v.*,
      (SELECT COUNT(*)::int FROM public.sessions s 
       WHERE s.venue_id = v.id 
         AND s.ends_at > NOW() 
         AND s.status = 'published') as active_sessions_count
    FROM public.venues v
    ${whereClause}
    ORDER BY v.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `
  
  params.push(limit, offset)
  
  const { rows } = await query(sql, params)
  return rows
}

async function createVenueClaim(venueId, userId) {
  const sql = `
    INSERT INTO public.venue_claims (
      venue_id,
      owner_id,
      status
    ) VALUES (
      $1, $2, 'pending'
    )
    RETURNING *
  `
  const { rows } = await query(sql, [venueId, userId])
  return rows[0]
}

async function getPendingClaim(venueId, userId) {
  const sql = `
    SELECT * FROM public.venue_claims 
    WHERE venue_id = $1 AND owner_id = $2 AND status = 'pending'
    LIMIT 1
  `
  const { rows } = await query(sql, [venueId, userId])
  return rows[0]
}

async function getVenueClaimById(id) {
  const sql = `SELECT * FROM public.venue_claims WHERE id = $1`
  const { rows } = await query(sql, [id])
  return rows[0]
}

async function updateVenueClaimStatus(claimId, status) {
  const sql = `
    UPDATE public.venue_claims
    SET status = $2, claimed_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE NULL END
    WHERE id = $1
    RETURNING *
  `
  const { rows } = await query(sql, [claimId, status])
  return rows[0]
}

async function updateVenueStatus(venueId, status) {
  const sql = `UPDATE public.venues SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`
  const { rows } = await query(sql, [venueId, status])
  return rows[0]
}

module.exports = {
  createVenue,
  findNearbyVenues,
  getVenueById,
  listVenues,
  createVenueClaim,
  getPendingClaim,
  getVenueClaimById,
  updateVenueClaimStatus,
  updateVenueStatus
}
