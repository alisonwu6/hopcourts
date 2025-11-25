const waitForDB = require('../utils/db')

function toDbFields(data, { partial = false } = {}) {
  const has = (prop) => Object.prototype.hasOwnProperty.call(data, prop)

  const pick = (prop, fallback) => {
    if (partial && !has(prop)) return undefined
    const value = data[prop]
    return value === undefined ? fallback : value
  }

  return {
    host_user_id: partial ? pick('creatorId') : data.creatorId,
    venue_id: pick('venueId', null),
    title: pick('title'),
    sport: pick('sport'),
    description: pick('description', null),
    skill_level: pick('skillLevel', 'mixed'),
    location_name: pick('locationName', null),
    address_line: pick('locationAddress', null),
    area: pick('area', null),
    city: pick('city', null),
    country_code: pick('countryCode', null),
    latitude: pick('latitude', null),
    longitude: pick('longitude', null),
    start_datetime: pick('startTime'),
    end_datetime: pick('endTime'),
    capacity: pick('maxPlayers'),
    price_type: pick('priceType', pick('price', 0) ? 'fixed' : 'free'),
    price_amount: pick('price', null),
    currency: pick('currency', null),
    notes_for_attendees: pick('notesForAttendees', null),
    cover_photo_url: pick('coverPhotoUrl', null),
    status: pick('status', 'scheduled'),
  }
}

async function createGame(payload) {
  const dbFields = toDbFields(payload)
  const db = await waitForDB()
  const columns = Object.keys(dbFields)
  const values = Object.values(dbFields)
  const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ')
  const res = await db.query(
    `INSERT INTO games (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
    values
  )
  return res.rows[0]?.id
}

async function updateGame(id, updates = {}) {
  const dbFields = toDbFields(updates, { partial: true })
  const entries = Object.entries(dbFields).filter(([, value]) => value !== undefined)
  if (!entries.length) return null

  const assignments = entries
    .map(([key], idx) => `${key} = $${idx + 1}`)
    .join(', ')
  const values = entries.map(([, value]) => value)
  values.push(id)

  const db = await waitForDB()
  await db.query(`UPDATE games SET ${assignments} WHERE id = $${entries.length + 1}`, values)
  return getGameById(id)
}

async function deleteGame(id) {
  const db = await waitForDB()
  await db.query('DELETE FROM games WHERE id = $1', [id])
}

async function cancelGame(id, reason) {
  const db = await waitForDB()
  await db.query('UPDATE games SET status = $1, notes_for_attendees = $2 WHERE id = $3', [
    'cancelled',
    reason ?? null,
    id,
  ])
  return getGameById(id)
}

async function listGames(filters = {}) {
  const db = await waitForDB()
  const params = []
  let whereClauses = []

  if (filters.sport) {
    params.push(filters.sport)
    whereClauses.push(`s.sport = $${params.length}`)
  }

  if (filters.area) {
    params.push(filters.area)
    whereClauses.push(`s.area = $${params.length}`)
  }

  if (filters.startDate) {
    params.push(filters.startDate)
    whereClauses.push(`s.start_datetime >= $${params.length}`)
  }

  if (filters.endDate) {
    params.push(filters.endDate)
    whereClauses.push(`s.start_datetime <= $${params.length}`)
  }

  if (filters.joinedUserId) {
    params.push(filters.joinedUserId)
    const idx = params.length
    whereClauses.push(`EXISTS (
      SELECT 1 FROM game_members gm
      WHERE gm.game_id = s.id
        AND gm.user_id = $${idx}
        AND gm.status = 'joined'
    )`)
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''

  const sql = `
    SELECT
      s.id,
      s.host_user_id AS creator_id,
      NULL::uuid AS venue_id,
      s.title,
      s.sport,
      s.description,
      s.skill_level,
      s.location_name,
      s.address_line AS location_address,
      s.area,
      s.city,
      s.country_code,
      s.latitude,
      s.longitude,
      s.start_datetime AS start_time,
      s.end_datetime AS end_time,
      s.capacity AS max_players,
      s.price_amount AS price,
      s.price_type,
      s.currency,
      s.status,
      s.notes_for_attendees AS cancel_reason,
      s.cover_photo_url AS hero_image_url,
      NULL::text AS host_name,
      NULL::text AS host_avatar,
      NULL::text AS venue_name,
      NULL::text AS venue_address,
      NULL::text AS venue_city,
      COALESCE(j.joined_count, 0) AS attendee_count
    FROM games s
    LEFT JOIN (
      SELECT game_id, COUNT(*) AS joined_count
      FROM game_members
      WHERE status = 'joined'
      GROUP BY game_id
    ) j ON j.game_id = s.id
    ${where}
    ORDER BY s.start_datetime ASC
  `

  const res = await db.query(sql, params)
  return res.rows
}

async function getGameById(id) {
  const db = await waitForDB()
  const sql = `
    SELECT
      s.id,
      s.host_user_id AS creator_id,
      s.title,
      s.sport,
      s.description,
      s.skill_level,
      s.location_name,
      s.address_line AS location_address,
      s.area,
      s.city,
      s.country_code,
      s.latitude,
      s.longitude,
      s.start_datetime AS start_time,
      s.end_datetime AS end_time,
      s.capacity AS max_players,
      s.price_amount AS price,
      s.price_type,
      s.currency,
      s.status,
      s.notes_for_attendees AS cancel_reason,
      s.cover_photo_url AS hero_image_url,
      NULL::text AS host_name,
      NULL::text AS host_avatar,
      NULL::text AS venue_name,
      NULL::text AS venue_address,
      NULL::text AS venue_city
    FROM games s
    WHERE s.id = $1
  `
  const res = await db.query(sql, [id])
  if (!res.rows[0]) return null

  const attendeesRes = await db.query(
    `SELECT
        gm.user_id AS player_id,
        gm.status,
        gm.joined_at
     FROM game_members gm
     WHERE gm.game_id = $1 AND gm.status = 'joined'
     ORDER BY gm.joined_at ASC`,
    [id]
  )

  return {
    ...res.rows[0],
    attendee_count: attendeesRes.rows.length,
    attendees: attendeesRes.rows,
    messages: [],
  }
}

module.exports = {
  createGame,
  updateGame,
  deleteGame,
  cancelGame,
  listGames,
  getGameById,
}
