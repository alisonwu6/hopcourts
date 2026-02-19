const { query } = require('../src/lib/db')

const BASE_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'host_user_id',
  'sport_key',
  'title',
  'notes as description',
  'starts_at',
  'ends_at',
  'place_name',
  'address',
  'lat',
  'lng',
  'checkin_radius_m',
  'checkin_open_mins_before',
  'checkin_close_mins_after',
  'min_people',
  'max_people',
  'status',
  'visibility',
  'skill_level',
  'gender',
  'photos',
  'is_free',
  'price_total',
  'price_per_person',
  'price_mode',
  'venue_id',
  'location_source',
  'price_note', // New Field
  'is_official', // New Field
]

async function listUpcomingSessions({
  city,
  sportKey,
  venueId,
  from,
  to,
  limit = 50,
  offset = 0,
} = {}) {
  const conditions = ["status = 'published'", "visibility = 'public'"]
  const params = []
  let idx = params.length

  if (venueId) {
    params.push(venueId)
    conditions.push(`venue_id = $${++idx}`)
  }

  if (from) {
    params.push(from)
    conditions.push(`starts_at >= $${++idx}`)
  } else {
    params.push(new Date())
    conditions.push(`starts_at >= $${++idx}`)
  }

  if (to) {
    params.push(to)
    conditions.push(`starts_at <= $${++idx}`)
  }
  if (sportKey) {
    params.push(sportKey)
    conditions.push(`sport_key = $${++idx}`)
  }
  if (city) {
    params.push(city)
    conditions.push(`address ILIKE $${++idx}`)
  }

  params.push(limit, offset)
  const sql = `
    select ${BASE_FIELDS.map(f => `s.${f}`).join(', ')},
      (select count(*) from public.session_participants where session_id = s.id) as participant_count,
      h.display_name as host_display_name,
      h.avatar_url as host_avatar_url,
      h.username as host_username,
      h.city_key as host_city_key,
      c.name_zh as host_city_name,
      v.status as venue_status,
      COALESCE(vp.logo_url, v.logo_url) as venue_logo_url,
      v.name_display as venue_name_display
    from public.sessions s
    left join public.users h on s.host_user_id = h.id
    left join public.cities c on h.city_key = c.key
    left join public.venues v on s.venue_id = v.id
    left join public.venue_profiles vp on v.id = vp.venue_id
    where ${conditions.map(c => `s.${c}`).join(' AND ')}
    order by s.starts_at asc
    limit $${idx + 1}
    offset $${idx + 2}
  `

  const { rows } = await query(sql, params)
  return rows
}

async function listMyUpcomingSessions({ userId, from, to, role = 'all' } = {}) {
  const params = [userId, from || new Date()]
  let idx = params.length
  
  let roleCondition = '(sp.user_id = $1 OR s.host_user_id = $1)'
  if (role === 'hosted') {
    roleCondition = 's.host_user_id = $1'
  } else if (role === 'joined') {
    // "Joined" means user has a participant record, including self-hosted sessions
    // if host also joined their own event.
    roleCondition = 'sp.user_id = $1'
  }

  const conditions = [
    roleCondition,
    '(s.ends_at IS NULL OR s.ends_at >= $2)',
    "s.status = 'published'",
  ]

  if (to) {
    params.push(to)
    conditions.push(`s.starts_at <= $${++idx}`)
  }

  const sql = `
    select DISTINCT ${BASE_FIELDS.map((f) => `s.${f}`).join(', ')},
      (select count(*) from public.session_participants where session_id = s.id) as participant_count,
      h.display_name as host_display_name,
      h.avatar_url as host_avatar_url,
      h.username as host_username,
      h.city_key as host_city_key,
      c.name_zh as host_city_name
    from public.sessions s
    left join public.session_participants sp on sp.session_id = s.id
    left join public.users h on s.host_user_id = h.id
    left join public.cities c on h.city_key = c.key
    where ${conditions.join(' AND ')}
    order by s.starts_at asc
  `
  const { rows } = await query(sql, params)
  return rows
}

async function listMyPastSessions({ userId, limit = 50, offset = 0 } = {}) {
  const params = [userId, new Date(), limit, offset]
  const sql = `
    select ${BASE_FIELDS.map((f) => `s.${f}`).join(', ')}
    from public.sessions s
    join public.session_participants sp on sp.session_id = s.id
    where sp.user_id = $1
      and s.ends_at is not null
      and s.ends_at < $2
    order by s.ends_at desc
    limit $3 offset $4
  `
  const { rows } = await query(sql, params)
  return rows
}

async function listMyHistorySessions({ userId, limit = 50, offset = 0, role = 'all' } = {}) {
  const now = new Date()
  const params = [userId, now, limit, offset]
  let roleCondition = '(sp.user_id = $1 OR s.host_user_id = $1)'
  if (role === 'hosted') {
    roleCondition = 's.host_user_id = $1'
  } else if (role === 'joined') {
    roleCondition = 'sp.user_id = $1'
  }

  const sql = `
    SELECT ${BASE_FIELDS.map((f) => `s.${f}`).join(', ')},
      (select count(*) from public.session_participants where session_id = s.id) as participant_count,
      h.display_name as host_display_name,
      h.avatar_url as host_avatar_url,
      h.username as host_username,
      h.city_key as host_city_key,
      c.name_zh as host_city_name
    FROM public.sessions s
    LEFT JOIN public.session_participants sp ON sp.session_id = s.id
    LEFT JOIN public.users h ON s.host_user_id = h.id
    LEFT JOIN public.cities c ON h.city_key = c.key
    WHERE ${roleCondition}
      AND (
        (s.ends_at IS NOT NULL AND s.ends_at < $2)
        OR (s.status = 'draft' AND s.host_user_id = $1)
      )
    ORDER BY
      CASE WHEN s.status = 'draft' THEN 0 ELSE 1 END ASC,
      s.starts_at DESC
    LIMIT $3 OFFSET $4
  `
  const { rows } = await query(sql, params)
  return rows
}
  // ...

async function getSessionById(sessionId) {
  const { rows } = await query(
    `select ${BASE_FIELDS.map(f => `s.${f}`).join(', ')},
       h.display_name as host_display_name,
       h.avatar_url as host_avatar_url,
       h.username as host_username,
       h.city_key as host_city_key,
       c.name_zh as host_city_name,
       v.status as venue_status,
       v.logo_url as venue_logo_url
     from public.sessions s
     left join public.users h on s.host_user_id = h.id
     left join public.cities c on h.city_key = c.key
     left join public.venues v on s.venue_id = v.id
     where s.id = $1`,
    [sessionId]
  )
  return rows[0] || null
}

async function getParticipantCount(sessionId) {
  const { rows } = await query(
    'select count(*)::int as count from public.session_participants where session_id = $1',
    [sessionId]
  )
  return rows[0]?.count ?? 0
}

async function createSession(input) {
  const sql = `
    insert into public.sessions (
      host_user_id,
      sport_key,
      venue_id,
      title,
      notes,
      starts_at,
      ends_at,
      place_name,
      address,
      lat,
      lng,
      checkin_radius_m,
      checkin_open_mins_before,
      checkin_close_mins_after,
      min_people,
      max_people,
      status,
      visibility,
      skill_level,
      gender,
      photos,
      is_free,
      price_total,
      price_per_person,
      price_mode,
      location_source,
      is_official,
      price_note
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
    )
    returning ${BASE_FIELDS.join(', ')}
  `
  const params = [
    input.hostUserId,
    input.sportKey,
    input.venueId ?? null,
    input.title ?? null,
    input.description ?? null,
    input.startAt,
    input.endAt ?? null,
    input.locationName,
    input.address ?? null,
    input.lat ?? 0,
    input.lng ?? 0,
    input.checkinRadiusM ?? 100,
    input.checkinOpenMinsBefore ?? 15,
    input.checkinCloseMinsAfter ?? 10,
    input.minPeople ?? 2,
    input.capacity ?? input.maxPeople ?? null,
    input.status ?? 'published',
    input.visibility ?? 'public',
    input.skillLevel ?? 'any',
    input.gender ?? 'mixed',
    input.photos ?? null,
    input.isFree ?? true,
    input.priceTotal ?? null,
    input.pricePerPerson ?? null,
    input.priceMode ?? 'total',
    input.locationSource ?? null,
    input.isOfficial ?? false,
    input.priceNote ?? null,
  ]

  const { rows } = await query(sql, params)
  return rows[0]
}

async function updateSession(sessionId, patch = {}) {
  const entries = Object.entries({
    sport_key: patch.sportKey,
    title: patch.title,
    venue_id: patch.venueId,
    notes: patch.description,
    starts_at: patch.startAt,
    ends_at: patch.endAt,
    place_name: patch.locationName,
    address: patch.address,
    lat: patch.lat,
    lng: patch.lng,
    checkin_radius_m: patch.checkinRadiusM,
    checkin_open_mins_before: patch.checkinOpenMinsBefore,
    checkin_close_mins_after: patch.checkinCloseMinsAfter,
    min_people: patch.minPeople,
    max_people: patch.maxPeople,
    status: patch.status,
    visibility: patch.visibility,
    skill_level: patch.skillLevel,
    gender: patch.gender,
    photos: patch.photos,
    is_free: patch.isFree,
    price_total: patch.priceTotal,
    price_per_person: patch.pricePerPerson,
    price_mode: patch.priceMode,
    is_official: patch.isOfficial,
    price_note: patch.priceNote,
  }).filter(([, value]) => value !== undefined)

  if (!entries.length) return getSessionById(sessionId)

  const sets = entries.map(
    ([key], idx) => `${key} = $${idx + 1}`
  )
  const params = entries.map(([, value]) => value)
  params.push(sessionId)

  const { rows } = await query(
    `update public.sessions set ${sets.join(', ')}, updated_at = NOW() where id = $${params.length} returning ${BASE_FIELDS.join(', ')}`,
    params
  )
  return rows[0] || null
}

async function setSessionStatus(sessionId, status) {
  const allowed = ['draft', 'published', 'cancelled', 'completed']
  if (!allowed.includes(status)) throw new Error('Invalid status')
  const { rows } = await query(
    `update public.sessions set status = $1, updated_at = NOW() where id = $2 returning ${BASE_FIELDS.join(', ')}`,
    [status, sessionId]
  )
  return rows[0] || null
}

async function countSessionParticipants(sessionId) {
  const { rows } = await query(
    'select count(*)::int as count from public.session_participants where session_id = $1',
    [sessionId]
  )
  return rows[0]?.count ?? 0
}

async function deleteSession(sessionId) {
  const { rows } = await query(
    'delete from public.sessions where id = $1 returning id',
    [sessionId]
  )
  return rows[0] || null
}

async function countHostedSessions(userId) {
  const { rows } = await query(
    "select count(*)::int as count from public.sessions where host_user_id = $1 and status != 'draft'",
    [userId]
  )
  return rows[0]?.count ?? 0
}

module.exports = {
  listUpcomingSessions,
  listMyUpcomingSessions,
  listMyPastSessions,
  listMyHistorySessions,
  getSessionById,
  createSession,
  updateSession,
  setSessionStatus,
  countSessionParticipants,
  getParticipantCount,
  deleteSession,
  countHostedSessions,
}
