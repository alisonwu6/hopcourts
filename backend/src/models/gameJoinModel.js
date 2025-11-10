const waitForDB = require('../utils/db')

async function joinGame(gameId, playerId) {
  const db = await waitForDB()
  await db.query(
    `INSERT INTO player_game_joins (game_id, player_id, status)
     VALUES ($1, $2, 'joined')
     ON CONFLICT (game_id, player_id)
     DO UPDATE SET status = EXCLUDED.status, created_at = CURRENT_TIMESTAMP`,
    [gameId, playerId]
  )
}

async function leaveGame(gameId, playerId) {
  const db = await waitForDB()
  await db.query(
    `UPDATE player_game_joins
     SET status = 'cancelled'
     WHERE game_id = $1 AND player_id = $2`,
    [gameId, playerId]
  )
}

async function listGamePlayers(gameId) {
  const db = await waitForDB()
  const res = await db.query(
    `SELECT psj.player_id, psj.status, psj.created_at, u.full_name, u.avatar_url
     FROM player_game_joins psj
     JOIN users u ON u.id = psj.player_id
     WHERE psj.game_id = $1`,
    [gameId]
  )
  return res.rows
}

module.exports = {
  joinGame,
  leaveGame,
  listGamePlayers,
}
