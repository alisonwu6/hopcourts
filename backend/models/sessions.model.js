const { query } = require('../db/client')

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
  'price',
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
    select ${BASE_FIELDS.map(f => `s.${f}`).join(', ')},
      (select count(*) from public.session_participants where session_id = s.id) as participant_count,
      h.display_name as host_display_name,
      h.avatar_url as host_avatar_url,
      h.username as host_username,
      h.country_key as host_country_key,
      h.city_key as host_city_key,
      c.name_zh as host_city_name
    from public.sessions s
    left join public.users h on s.host_user_id = h.id
    left join public.cities c on h.city_key = c.key
    where ${conditions.map(c => `s.${c}`).join(' AND ')}
    order by s.starts_at asc
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
    '(sp.user_id = $1 OR s.host_user_id = $1)',
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
      h.country_key as host_country_key,
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

async function listMyHistorySessions({ userId, limit = 50, offset = 0 } = {}) {
  // History includes:
  // 1. Sessions I participated in that are ENDED (ends_at < now)
  // 2. Sessions I HOSTED that are DRAFT (regardless of time)
  // 3. (Optional) Sessions I HOSTED that are CANCELLED ? 
  // Let's stick to Past Participation (which includes hosted past events if I joined them) + Hosted Drafts.
  // Assuming host always joins automatically.
  
  // We can do a UNION query.
  // Part 1: Past Sessions
  // Part 2: Drafts (Owner = Me & Status = Draft)
  
  const now = new Date()
  const params = [userId, now, limit, offset] // $1=userId, $2=now, $3=limit, $4=offset
  
  const sql = `
    SELECT ${BASE_FIELDS.map((f) => `sub.${f}`).join(', ')},
      (select count(*) from public.session_participants where session_id = sub.id) as participant_count
    FROM (
      -- 1. My Past Participation (Joined & Ended)
      SELECT s.*,
        h.display_name as host_display_name,
        h.avatar_url as host_avatar_url,
        h.username as host_username,
        h.country_key as host_country_key,
        h.city_key as host_city_key,
        c.name_zh as host_city_name
      FROM public.sessions s
      LEFT JOIN public.session_participants sp ON sp.session_id = s.id
      LEFT JOIN public.users h ON s.host_user_id = h.id
      LEFT JOIN public.cities c ON h.city_key = c.key
      WHERE (sp.user_id = $1 OR s.host_user_id = $1)
        AND s.ends_at IS NOT NULL
        AND s.ends_at < $2
      
      UNION
      
      -- 2. My Drafts (Hosted by me & Status = 'draft')
      SELECT s.*,
        h.display_name as host_display_name,
        h.avatar_url as host_avatar_url,
        h.username as host_username,
        h.country_key as host_country_key,
        h.city_key as host_city_key,
        c.name_zh as host_city_name
      FROM public.sessions s
      LEFT JOIN public.users h ON s.host_user_id = h.id
      LEFT JOIN public.cities c ON h.city_key = c.key
      WHERE s.host_user_id = $1
        AND s.status = 'draft'
    ) sub
    ORDER BY 
      CASE WHEN sub.status = 'draft' THEN 0 ELSE 1 END ASC, -- Drafts first? Or Chronological? Let's sort by date desc, nulls last?
      sub.starts_at DESC
    LIMIT $3 OFFSET $4
  `
  // Note on ordering:
  // If we want Drafts at the top, we can use custom order.
  // User asked for "History" containing "Completed and Draft".
  // Usually drafts are "Actionable", so maybe at top.
  // Or just mixed by date. Drafts have future dates usually?
  // Let's sort simply by created_at desc or starts_at desc.
  // Updated SQL order: Drafts first (status='draft'), then recent history?
  
  const { rows } = await query(sql, params)
  return rows
}

async function getSessionById(sessionId) {
  const { rows } = await query(
    `select ${BASE_FIELDS.map(f => `s.${f}`).join(', ')},
       h.display_name as host_display_name,
       h.avatar_url as host_avatar_url,
       h.username as host_username,
       h.country_key as host_country_key,
       h.city_key as host_city_key,
       c.name_zh as host_city_name
     from public.sessions s
     left join public.users h on s.host_user_id = h.id
     left join public.cities c on h.city_key = c.key
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
      price
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
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
    input.price ?? null,
  ]

  const { rows } = await query(sql, params)
  return rows[0]
}

async function updateSession(sessionId, patch = {}) {
  const entries = Object.entries({
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
    price: patch.price,
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

async function deleteSession(sessionId) {
  const { rows } = await query(
    'delete from public.sessions where id = $1 returning id',
    [sessionId]
  )
  return rows[0] || null
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
}
