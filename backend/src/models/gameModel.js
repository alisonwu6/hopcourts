const waitForDB = require('../utils/db')

function toDbFields(data, { partial = false } = {}) {
  const has = (prop) => Object.prototype.hasOwnProperty.call(data, prop)

  const pick = (prop, fallback) => {
    if (partial && !has(prop)) return undefined
    const value = data[prop]
    return value === undefined ? fallback : value
  }

  return {
    creator_id: partial ? pick('creatorId') : data.creatorId,
    venue_id: pick('venueId', null),
    title: pick('title'),
    sport: pick('sport'),
    description: pick('description', null),
    skill_level: pick('skillLevel', 'mixed'),
    energy: pick('energy', 60),
    location_name: pick('locationName', null),
    location_address: pick('locationAddress', null),
    area: pick('area', null),
    city: pick('city', null),
    latitude: pick('latitude', null),
    longitude: pick('longitude', null),
    start_time: pick('startTime'),
    end_time: pick('endTime'),
    max_players: pick('maxPlayers'),
    price: pick('price', 0),
    currency: pick('currency', 'AUD'),
    requires_approval: pick('requiresApproval', false),
    status: pick('status', 'scheduled'),
    cancel_reason: pick('cancelReason', null),
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
  await db.query('UPDATE games SET status = $1, cancel_reason = $2 WHERE id = $3', [
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
    whereClauses.push(`s.start_time >= $${params.length}`)
  }

  if (filters.endDate) {
    params.push(filters.endDate)
    whereClauses.push(`s.start_time <= $${params.length}`)
  }

  if (filters.joinedUserId) {
    params.push(filters.joinedUserId)
    const idx = params.length
    whereClauses.push(`EXISTS (
      SELECT 1 FROM player_game_joins ps
      WHERE ps.game_id = s.id
        AND ps.player_id = $${idx}
        AND ps.status = 'joined'
    )`)
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''

  const sql = `
    SELECT
      s.*,
      u.full_name AS host_name,
      u.avatar_url AS host_avatar,
      v.name AS venue_name,
      COALESCE(j.joined_count, 0) AS attendee_count
    FROM games s
    JOIN users u ON u.id = s.creator_id
    LEFT JOIN venues v ON v.id = s.venue_id
    LEFT JOIN (
      SELECT game_id, COUNT(*) AS joined_count
      FROM player_game_joins
      WHERE status = 'joined'
      GROUP BY game_id
    ) j ON j.game_id = s.id
    ${where}
    ORDER BY s.start_time ASC
  `

  const res = await db.query(sql, params)
  return res.rows
}

async function getGameById(id) {
  const db = await waitForDB()
  const sql = `
    SELECT
      s.*,
      u.full_name AS host_name,
      u.avatar_url AS host_avatar,
      v.name AS venue_name,
      v.address AS venue_address,
      v.city AS venue_city
    FROM games s
    JOIN users u ON u.id = s.creator_id
    LEFT JOIN venues v ON v.id = s.venue_id
    WHERE s.id = $1
  `
  const res = await db.query(sql, [id])
  if (!res.rows[0]) return null

  const attendeesRes = await db.query(
    `SELECT psj.player_id, psj.status, users.full_name, users.avatar_url
     FROM player_game_joins psj
     JOIN users ON users.id = psj.player_id
     WHERE psj.game_id = $1 AND psj.status = 'joined'
     ORDER BY psj.created_at ASC`,
    [id]
  )

  const messagesRes = await db.query(
    `SELECT m.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.game_id = $1
     ORDER BY m.created_at ASC`,
    [id]
  )

  return {
    ...res.rows[0],
    attendee_count: attendeesRes.rows.length,
    attendees: attendeesRes.rows,
    messages: messagesRes.rows,
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
