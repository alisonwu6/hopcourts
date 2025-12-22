const { query } = require('../db/client')

async function replaceUserSports(userId, sports = []) {
  // sports: [{ sport_key, kind }]
  const clientSports = sports.filter((s) => s?.sport_key && s?.kind)
  await query('delete from public.user_sports where user_id = $1', [userId])
  if (!clientSports.length) return []
  const values = clientSports
    .map((_, idx) => `($1, $${idx * 2 + 2}, $${idx * 2 + 3})`)
    .join(', ')
  const params = [userId, ...clientSports.flatMap((s) => [s.sport_key, s.kind])]
  const { rows } = await query(
    `insert into public.user_sports (user_id, sport_key, kind) values ${values} returning user_id, sport_key, kind`,
    params
  )
  return rows
}

async function listUserSports(userId) {
  const { rows } = await query(
    `select sport_key, kind, created_at from public.user_sports where user_id = $1 order by created_at asc`,
    [userId]
  )
  return rows
}

module.exports = { replaceUserSports, listUserSports }
