const { query } = require('../src/lib/db')

async function replaceUserSports(userId, sports = []) {
  // sports: [{ sport_key, kind }]
  // DB schema: status IN ('favorite', 'trying')
  
  // Deduplicate by sport_key (last one wins) to prevent PK violation
  const uniqueSportsMap = new Map()
  
  sports
    .filter((s) => s?.sport_key && s?.kind)
    .forEach((s) => {
      uniqueSportsMap.set(s.sport_key, {
        sport_key: s.sport_key,
        status: s.kind.toLowerCase(),
        level: s.level || null
      })
    })

  const clientSports = Array.from(uniqueSportsMap.values())

  await query('delete from public.user_sports where user_id = $1', [userId])
  
  if (!clientSports.length) return []

  const values = clientSports
    .map((_, idx) => `($1, $${idx * 3 + 2}, $${idx * 3 + 3}, $${idx * 3 + 4})`)
    .join(', ')
  
  const params = [userId, ...clientSports.flatMap((s) => [s.sport_key, s.status, s.level])]

  const { rows } = await query(
    `insert into public.user_sports (user_id, sport_key, status, level) 
     values ${values} 
     returning sport_key, status, level`,
    params
  )
  
  return rows.map(row => ({
    sport_key: row.sport_key,
    kind: row.status.toUpperCase(),
    level: row.level
  }))
}

async function listUserSports(userId) {
  const { rows } = await query(
    `select sport_key, status, level, created_at from public.user_sports where user_id = $1 order by created_at asc`,
    [userId]
  )
  return rows.map(row => ({
    sport_key: row.sport_key,
    kind: row.status.toUpperCase(), // 'favorite' -> 'FAVORITE'
    level: row.level
  }))
}

module.exports = { replaceUserSports, listUserSports }
