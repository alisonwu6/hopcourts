const waitForDB = require('../utils/db')

async function joinGame(gameId, playerId) {
  const db = await waitForDB()
  await db.execute(
    `INSERT INTO player_game_joins (game_id, player_id, status)
     VALUES (?, ?, 'joined')
     ON DUPLICATE KEY UPDATE status = 'joined', created_at = CURRENT_TIMESTAMP`,
    [gameId, playerId]
  )
}

async function leaveGame(gameId, playerId) {
  const db = await waitForDB()
  await db.execute(
    `UPDATE player_game_joins
     SET status = 'cancelled'
     WHERE game_id = ? AND player_id = ?`,
    [gameId, playerId]
  )
}

async function listGamePlayers(gameId) {
  const db = await waitForDB()
  const [rows] = await db.execute(
    `SELECT psj.player_id, psj.status, psj.created_at, u.full_name, u.avatar_url
     FROM player_game_joins psj
     JOIN users u ON u.id = psj.player_id
     WHERE psj.game_id = ?`,
    [gameId]
  )
  return rows
}

module.exports = {
  joinGame,
  leaveGame,
  listGamePlayers,
}
