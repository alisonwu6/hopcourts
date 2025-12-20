const { query } = require('../db/client')

const BASE_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'host_user_id',
  'sport_key',
  'title',
  'notes',
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
]

async function listUpcomingSessions({
  city,
  sportKey,
  from,
  to,
  limit = 50,
  offset = 0,
} = {}) {
  const conditions = ["status = 'published'", "visibility = 'public'"]
  const params = []
  let idx = params.length

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
    select ${BASE_FIELDS.join(', ')}
    from public.sessions
    where ${conditions.join(' AND ')}
    order by starts_at asc
    limit $${idx + 1}
    offset $${idx + 2}
  `

  const { rows } = await query(sql, params)
  return rows
}

async function listMyUpcomingSessions({ userId, from, to } = {}) {
  const params = [userId, from || new Date()]
  let idx = params.length
  const conditions = [
    'sp.user_id = $1',
    's.starts_at >= $2',
    "s.status = 'published'",
  ]

  if (to) {
    params.push(to)
    conditions.push(`s.starts_at <= $${++idx}`)
  }

  const sql = `
    select ${BASE_FIELDS.map((f) => `s.${f}`).join(', ')}
    from public.sessions s
    join public.session_participants sp on sp.session_id = s.id
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

async function getSessionById(sessionId) {
  const { rows } = await query(
    `select ${BASE_FIELDS.join(', ')} from public.sessions where id = $1`,
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
      visibility
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
    )
    returning ${BASE_FIELDS.join(', ')}
  `
  const params = [
    input.hostUserId,
    input.sportKey,
    input.title ?? null,
    input.notes ?? null,
    input.startAt,
    input.endAt ?? null,
    input.locationName,
    input.address ?? null,
    input.lat ?? 0,
    input.lng ?? 0,
    input.checkinRadiusM ?? 100,
    input.checkinOpenMinsBefore ?? 20,
    input.checkinCloseMinsAfter ?? 20,
    input.minPeople ?? 2,
    input.capacity ?? input.maxPeople ?? null,
    input.status ?? 'published',
    input.visibility ?? 'public',
  ]

  const { rows } = await query(sql, params)
  return rows[0]
}

async function updateSession(sessionId, patch = {}) {
  const entries = Object.entries({
    title: patch.title,
    notes: patch.notes,
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
  }).filter(([, value]) => value !== undefined)

  if (!entries.length) return getSessionById(sessionId)

  const sets = entries.map(
    ([key], idx) => `${key} = $${idx + 1}`
  )
  const params = entries.map(([, value]) => value)
  params.push(sessionId)

  const { rows } = await query(
    `update public.sessions set ${sets.join(', ')} where id = $${params.length} returning ${BASE_FIELDS.join(', ')}`,
    params
  )
  return rows[0] || null
}

async function setSessionStatus(sessionId, status) {
  const allowed = ['draft', 'published', 'cancelled', 'completed']
  if (!allowed.includes(status)) throw new Error('Invalid status')
  const { rows } = await query(
    `update public.sessions set status = $1 where id = $2 returning ${BASE_FIELDS.join(', ')}`,
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

module.exports = {
  listUpcomingSessions,
  listMyUpcomingSessions,
  listMyPastSessions,
  getSessionById,
  createSession,
  updateSession,
  setSessionStatus,
  countSessionParticipants,
  getParticipantCount,
}
