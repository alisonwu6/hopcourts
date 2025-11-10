const waitForDB = require('../utils/db')

async function replacePlayerSports(userId, sports = []) {
  const db = await waitForDB()
  await db.query('DELETE FROM player_sports WHERE user_id = $1', [userId])

  if (!sports.length) return

  const rows = sports.map((item) => [
    userId,
    item.sport,
    item.skill_level || item.skillLevel,
    item.playing_style || item.playingStyle || 'mixed',
  ])

  const flatValues = rows.flat()
  const placeholders = rows
    .map(
      (_, idx) =>
        `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`
    )
    .join(', ')

  await db.query(
    `INSERT INTO player_sports (user_id, sport, skill_level, playing_style) VALUES ${placeholders}`,
    flatValues
  )
}

async function replacePreferredAreas(userId, areas = []) {
  const db = await waitForDB()
  await db.query('DELETE FROM player_preferred_areas WHERE user_id = $1', [userId])
  if (!areas.length) return

  const rows = areas.map((item) => [
    userId,
    item.area_name || item.areaName || item.label,
    item.postal_code || item.postalCode || null,
  ])
  const flatValues = rows.flat()
  const placeholders = rows
    .map(
      (_, idx) => `($${idx * 3 + 1}, $${idx * 3 + 2}, $${idx * 3 + 3})`
    )
    .join(', ')
  await db.query(
    `INSERT INTO player_preferred_areas (user_id, area_name, postal_code) VALUES ${placeholders}`,
    flatValues
  )
}

async function getPlayerProfile(userId) {
  const db = await waitForDB()
  const sportsRes = await db.query(
    'SELECT sport, skill_level, playing_style FROM player_sports WHERE user_id = $1',
    [userId]
  )
  const areasRes = await db.query(
    'SELECT area_name, postal_code FROM player_preferred_areas WHERE user_id = $1',
    [userId]
  )
  return { sports: sportsRes.rows, areas: areasRes.rows }
}

module.exports = {
  replacePlayerSports,
  replacePreferredAreas,
  getPlayerProfile,
}
