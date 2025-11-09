const waitForDB = require('../utils/db')

function toDbFields(data) {
  return {
    creator_id: data.creatorId,
    venue_id: data.venueId ?? null,
    title: data.title,
    sport: data.sport,
    description: data.description ?? null,
    skill_level: data.skillLevel ?? 'mixed',
    energy: data.energy ?? 60,
    location_name: data.locationName ?? null,
    location_address: data.locationAddress ?? null,
    area: data.area ?? null,
    city: data.city ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    start_time: data.startTime,
    end_time: data.endTime,
    max_players: data.maxPlayers,
    price: data.price ?? 0,
    currency: data.currency ?? 'AUD',
    requires_approval: data.requiresApproval ?? false,
    status: data.status ?? 'scheduled',
  }
}

async function createGame(payload) {
  const dbFields = toDbFields(payload)
  const db = await waitForDB()
  const columns = Object.keys(dbFields)
  const values = Object.values(dbFields)
  const placeholders = columns.map(() => '?').join(', ')
  const [result] = await db.execute(
    `INSERT INTO games (${columns.join(', ')}) VALUES (${placeholders})`,
    values
  )
  return result.insertId
}

async function updateGame(id, updates = {}) {
  const dbFields = toDbFields(updates)
  const entries = Object.entries(dbFields).filter(
    ([, value]) => value !== undefined
  )
  if (!entries.length) return null

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ')
  const values = entries.map(([, value]) => value)
  values.push(id)

  const db = await waitForDB()
  await db.execute(`UPDATE games SET ${setClause} WHERE id = ?`, values)
  return getGameById(id)
}

async function deleteGame(id) {
  const db = await waitForDB()
  await db.execute('DELETE FROM games WHERE id = ?', [id])
}

async function listGames(filters = {}) {
  const db = await waitForDB()
  const params = []
  let whereClauses = []

  if (filters.sport) {
    whereClauses.push('s.sport = ?')
    params.push(filters.sport)
  }

  if (filters.area) {
    whereClauses.push('s.area = ?')
    params.push(filters.area)
  }

  if (filters.startDate) {
    whereClauses.push('s.start_time >= ?')
    params.push(filters.startDate)
  }

  if (filters.endDate) {
    whereClauses.push('s.start_time <= ?')
    params.push(filters.endDate)
  }

  if (filters.joinedUserId) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM player_game_joins ps
      WHERE ps.game_id = s.id
        AND ps.player_id = ?
        AND ps.status = 'joined'
    )`)
    params.push(filters.joinedUserId)
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''

  const sql = `
    SELECT
      s.*,
      u.full_name AS host_name,
      u.avatar_url AS host_avatar,
      v.name AS venue_name,
      IFNULL(j.joined_count, 0) AS attendee_count
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

  const [rows] = await db.execute(sql, params)
  return rows
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
    WHERE s.id = ?
  `
  const [rows] = await db.execute(sql, [id])
  if (!rows[0]) return null

  const [attendees] = await db.execute(
    `SELECT psj.player_id, psj.status, users.full_name, users.avatar_url
     FROM player_game_joins psj
     JOIN users ON users.id = psj.player_id
     WHERE psj.game_id = ? AND psj.status = 'joined'
     ORDER BY psj.created_at ASC`,
    [id]
  )

  const [messages] = await db.execute(
    `SELECT m.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.game_id = ?
     ORDER BY m.created_at ASC`,
    [id]
  )

  return {
    ...rows[0],
    attendee_count: attendees.length,
    attendees,
    messages,
  }
}

module.exports = {
  createGame,
  updateGame,
  deleteGame,
  listGames,
  getGameById,
}
