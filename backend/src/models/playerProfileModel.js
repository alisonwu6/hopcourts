const waitForDB = require('../utils/db')

async function replacePlayerSports(userId, sports = []) {
  const db = await waitForDB()
  await db.execute('DELETE FROM player_sports WHERE user_id = ?', [userId])

  if (!sports.length) return

  const values = sports.map((item) => [
    userId,
    item.sport,
    item.skill_level || item.skillLevel,
    item.playing_style || item.playingStyle || 'mixed',
  ])

  await db.query(
    'INSERT INTO player_sports (user_id, sport, skill_level, playing_style) VALUES ?',
    [values]
  )
}

async function replacePreferredAreas(userId, areas = []) {
  const db = await waitForDB()
  await db.execute('DELETE FROM player_preferred_areas WHERE user_id = ?', [userId])
  if (!areas.length) return

  const values = areas.map((item) => [
    userId,
    item.area_name || item.areaName || item.label,
    item.postal_code || item.postalCode || null,
  ])
  await db.query(
    'INSERT INTO player_preferred_areas (user_id, area_name, postal_code) VALUES ?',
    [values]
  )
}

async function getPlayerProfile(userId) {
  const db = await waitForDB()
  const [sports] = await db.execute('SELECT sport, skill_level, playing_style FROM player_sports WHERE user_id = ?', [userId])
  const [areas] = await db.execute('SELECT area_name, postal_code FROM player_preferred_areas WHERE user_id = ?', [userId])
  return { sports, areas }
}

module.exports = {
  replacePlayerSports,
  replacePreferredAreas,
  getPlayerProfile,
}
