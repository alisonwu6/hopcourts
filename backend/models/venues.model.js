const { query } = require('../src/lib/db')

async function createVenue(input) {
  const sql = `
    INSERT INTO public.venues (
      name,
      name_display,
      address,
      lat,
      lng,
      status
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    )
    RETURNING *
  `
  const params = [
    input.name,
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
      COALESCE(v.name_display, v.name) as name_display,
      v.address as address_display,
      COALESCE(vp.logo_url, v.logo_url) as logo_url,
      (SELECT COUNT(*)::int FROM public.sessions s 
       WHERE s.venue_id = v.id 
         AND s.ends_at > NOW() 
         AND s.status = 'published') as active_sessions_count
    FROM public.venues v
    LEFT JOIN public.venue_profiles vp ON v.id = vp.venue_id
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
      COALESCE(v.name_display, v.name) as name_display,
      v.address as address_display,
      COALESCE(vp.logo_url, v.logo_url) as logo_url,
      (SELECT COUNT(*)::int FROM public.sessions s 
       WHERE s.venue_id = v.id 
         AND s.ends_at > NOW() 
         AND s.status = 'published') as active_sessions_count
    FROM public.venues v
    LEFT JOIN public.venue_profiles vp ON v.id = vp.venue_id
    ${whereClause}
    ORDER BY v.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `
  
  params.push(limit, offset)
  
  const { rows } = await query(sql, params)
  return rows
}

async function createVenueClaim(venueId, userId, claimData = {}) {
  // Guard: Check for duplicate pending claim by same user
  const existingClaim = await getPendingClaim(venueId, userId)
  if (existingClaim) {
    throw new Error('您已送出過申請，請耐心等候審核。')
  }

  const sql = `
    INSERT INTO public.venue_claims (
      venue_id,
      owner_id,
      contact_name,
      contact_person,
      contact_title,
      contact_phone,
      contact_email,
      note,
      status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, 'pending'
    )
    RETURNING *
  `
  const { rows } = await query(sql, [
    venueId, 
    userId,
    claimData.contact_name || null,
    claimData.contact_person || null,
    claimData.contact_title || null,
    claimData.contact_phone || null,
    claimData.contact_email || null,
    claimData.note || null
  ])
  return rows[0]
}

async function getApprovedClaim(venueId) {
  const sql = `
    SELECT * FROM public.venue_claims 
    WHERE venue_id = $1 AND status = 'approved'
    LIMIT 1
  `
  const { rows } = await query(sql, [venueId])
  return rows[0]
}

async function getPendingClaimByEmail(venueId, email) {
  const sql = `
    SELECT * FROM public.venue_claims 
    WHERE venue_id = $1 AND contact_email = $2 AND status = 'pending'
    LIMIT 1
  `
  const { rows } = await query(sql, [venueId, email])
  return rows[0]
}

async function getApprovedClaimByUser(venueId, userId) {
  const sql = `
    SELECT * FROM public.venue_claims 
    WHERE venue_id = $1 AND owner_id = $2 AND status = 'approved'
    LIMIT 1
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
    SET
      status = $2,
      reviewed_at = CASE WHEN $2 IN ('approved', 'rejected') THEN NOW() ELSE reviewed_at END
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

// --- Admin/Governance Operations (C0) ---

async function writeAuditLog({ adminId, action, targetId, targetType, note }) {
  const sql = `
    INSERT INTO public.venue_audit_logs (
      admin_id, action, target_id, target_type, note
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `
  const { rows } = await query(sql, [adminId, action, targetId, targetType, note])
  return rows[0]
}

async function getAdminVenues({ search, limit = 50, offset = 0 } = {}) {
  let conditions = []
  let params = []

  if (search) {
    conditions.push(`(COALESCE(v.name_display, v.name) ILIKE $1 OR v.id::text = $1)`)
    params.push(`%${search}%`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  
  const sql = `
    SELECT 
      v.*,
      c.id as claim_id,
      c.status as claim_status,
      c.contact_email,
      pc.id as pending_claim_id,
      pc.contact_name as pending_contact_name,
      pc.contact_email as pending_contact_email,
      (SELECT MAX(starts_at) FROM public.sessions s WHERE s.venue_id = v.id) as last_activity_at
    FROM public.venues v
    LEFT JOIN public.venue_claims c ON c.venue_id = v.id AND c.status = 'approved'
    LEFT JOIN LATERAL (
      SELECT id, contact_name, contact_email 
      FROM public.venue_claims 
      WHERE venue_id = v.id AND status = 'pending' 
      ORDER BY created_at DESC LIMIT 1
    ) pc ON true
    ${whereClause}
    ORDER BY v.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `
  params.push(limit, offset)
  const { rows } = await query(sql, params)
  return rows
}

async function revokeVenueClaim(claimId) {
  // 1. Get the claim to know the venue_id
  const claim = await getVenueClaimById(claimId)
  if (!claim) throw new Error('Claim not found')

  // 2. Mark claim as rejected since venue_claims status only allows pending/approved/rejected.
  const sqlUpdateClaim = `
    UPDATE public.venue_claims 
    SET status = 'rejected', reviewed_at = NOW()
    WHERE id = $1 
    RETURNING *
  `
  const { rows: claimRows } = await query(sqlUpdateClaim, [claimId])

  // 3. Set venue back to unclaimed
  await updateVenueStatus(claim.venue_id, 'unclaimed')

  return claimRows[0]
}

async function getAdminClaims({ status = undefined, limit = 50, offset = 0 } = {}) {
  let conditions = []
  let params = []
  let paramIndex = 1

  if (status && status !== 'all') {
    conditions.push(`vc.status = $${paramIndex++}`)
    params.push(status)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const sql = `
    SELECT 
      vc.id,
      vc.venue_id,
      v.name_display as venue_name,
      v.address as venue_address,
      vc.contact_name as applicant_name,
      vc.contact_email as applicant_email,
      vc.contact_title as applicant_role,
      vc.contact_phone as applicant_phone,
      vc.note,
      vc.status,
      vc.created_at as submitted_at,
      vc.reviewed_at,
      u.email as reviewed_by
    FROM public.venue_claims vc
    JOIN public.venues v ON vc.venue_id = v.id
    LEFT JOIN public.users u ON vc.reviewed_by_admin_id = u.id
    ${whereClause}
    ORDER BY vc.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `
  params.push(limit, offset)
  
  const { rows } = await query(sql, params)
  return rows
}

async function patchVenueDisplay(id, { name_display, address_display }) {
  const sql = `
    UPDATE public.venues 
    SET 
      name_display = COALESCE($2, name_display),
      address = COALESCE($3, address),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `
  const { rows } = await query(sql, [id, name_display, address_display])
  return rows[0]
}

async function getManagedVenues(userId) {
  const sql = `
    SELECT v.*, vc.contact_email
    FROM public.venues v
    JOIN public.venue_claims vc ON v.id = vc.venue_id
    WHERE vc.owner_id = $1 AND vc.status = 'approved'
    ORDER BY v.created_at DESC
  `
  const { rows } = await query(sql, [userId])
  return rows
}

async function getVenueProfile(venueId) {
  const sql = `SELECT * FROM public.venue_profiles WHERE venue_id = $1`
  const { rows } = await query(sql, [venueId])
  return rows[0]
}

async function upsertVenueProfile(venueId, data) {
  const sql = `
    INSERT INTO public.venue_profiles (
      venue_id, logo_url, cover_url, description, social_links, opening_hours, images, amenities, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW()
    )
    ON CONFLICT (venue_id) DO UPDATE SET
      logo_url = COALESCE($2, public.venue_profiles.logo_url),
      cover_url = COALESCE($3, public.venue_profiles.cover_url),
      description = COALESCE($4, public.venue_profiles.description),
      social_links = COALESCE($5, public.venue_profiles.social_links),
      opening_hours = COALESCE($6, public.venue_profiles.opening_hours),
      images = COALESCE($7, public.venue_profiles.images),
      amenities = COALESCE($8, public.venue_profiles.amenities),
      updated_at = NOW()
    RETURNING *
  `
  const params = [
    venueId,
    data.logo_url || null,
    data.cover_url || null,
    data.description || null,
    data.social_links ? JSON.stringify(data.social_links) : null,
    data.opening_hours ? JSON.stringify(data.opening_hours) : null,
    data.images ? JSON.stringify(data.images) : null,
    data.amenities ? JSON.stringify(data.amenities) : null,
  ]

  const { rows } = await query(sql, params)
  return rows[0]
}

async function getVenueStats(venueId) {
  const sql = `
    SELECT
      (SELECT COUNT(DISTINCT user_id)::int
       FROM public.check_ins
       WHERE venue_id = $1 AND checked_in_at >= NOW() - INTERVAL '7 days') AS active_users,
      (SELECT COUNT(*)::int
       FROM public.session_participants sp
       JOIN public.sessions s ON sp.session_id = s.id
       WHERE s.venue_id = $1
         AND s.starts_at >= date_trunc('week', NOW())
         AND s.starts_at < date_trunc('week', NOW()) + INTERVAL '7 days') AS participants_of_the_week,
      (SELECT COUNT(DISTINCT sp.user_id)::int
       FROM public.session_participants sp
       JOIN public.sessions s ON sp.session_id = s.id
       WHERE s.venue_id = $1) AS total_players
  `
  const { rows } = await query(sql, [venueId])
  return rows[0]
}

module.exports = {
  createVenue,
  findNearbyVenues,
  getVenueById,
  listVenues,
  createVenueClaim,
  getPendingClaimByEmail,
  getApprovedClaim,
  getApprovedClaimByUser,
  getVenueClaimById,
  updateVenueClaimStatus,
  updateVenueStatus,
  // C0 Export
  writeAuditLog,
  getAdminVenues,
  getAdminClaims,
  revokeVenueClaim,
  patchVenueDisplay,
  // C1 Export
  getManagedVenues,
  getVenueProfile,
  upsertVenueProfile,
  getVenueStats,
}
