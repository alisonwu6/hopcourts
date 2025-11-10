const waitForDB = require('../utils/db')

async function createMessage({ gameId, senderId, body }) {
  const db = await waitForDB()
  const res = await db.query(
    `INSERT INTO messages (game_id, sender_id, body) VALUES ($1, $2, $3) RETURNING id`,
    [gameId, senderId, body]
  )
  return res.rows[0]?.id
}

async function listMessages(gameId, limit = 100) {
  const db = await waitForDB()
  const res = await db.query(
    `SELECT m.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.game_id = $1
     ORDER BY m.created_at ASC
     LIMIT $2`,
    [gameId, limit]
  )
  return res.rows
}

module.exports = {
  createMessage,
  listMessages,
}
