const { query } = require('../db/client')

async function getPreferences(userId) {
  const { rows } = await query(
    `select user_id, preferred_time, sessions_per_week, day_slots, created_at, updated_at
     from public.user_preferences where user_id = $1`,
    [userId]
  )
  return rows[0] || null
}

async function upsertPreferences(userId, prefs = {}) {
  const { rows } = await query(
    `insert into public.user_preferences (user_id, preferred_time, sessions_per_week, day_slots)
     values ($1, $2, $3, $4)
     on conflict (user_id) do update set
       preferred_time = excluded.preferred_time,
       sessions_per_week = excluded.sessions_per_week,
       day_slots = excluded.day_slots
     returning *`,
    [userId, prefs.preferred_time ?? null, prefs.sessions_per_week ?? null, prefs.day_slots ?? null]
  )
  return rows[0]
}

module.exports = { getPreferences, upsertPreferences }
