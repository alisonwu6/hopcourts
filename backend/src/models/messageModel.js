const waitForDB = require('../utils/db')

async function createMessage({ gameId, senderId, body }) {
  const db = await waitForDB()
  const [result] = await db.execute(
    `INSERT INTO messages (game_id, sender_id, body) VALUES (?, ?, ?)`,
    [gameId, senderId, body]
  )
  return result.insertId
}

async function listMessages(gameId, limit = 100) {
  const db = await waitForDB()
  const [rows] = await db.execute(
    `SELECT m.*, u.full_name AS sender_name, u.avatar_url AS sender_avatar
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.game_id = ?
     ORDER BY m.created_at ASC
     LIMIT ?`,
    [gameId, limit]
  )
  return rows
}

module.exports = {
  createMessage,
  listMessages,
}
