const { query } = require('../db/client')

async function getPreferences(userId) {
  const { rows } = await query(
    `select user_id, preferred_time_slots, sessions_per_week_goal, preferred_days, updated_at
     from public.user_preferences where user_id = $1`,
    [userId]
  )
  return rows[0] || null
}

async function upsertPreferences(userId, prefs = {}) {
  // Map input keys to schema keys if needed, assuming controller passes aligned names or we map here.
  // Controller passes: preferred_time, sessions_per_week, day_slots (based on previous view of service)
  // We should align parameters carefully.
  const { rows } = await query(
    `insert into public.user_preferences (user_id, preferred_time_slots, sessions_per_week_goal, preferred_days)
     values ($1, $2, $3, $4)
     on conflict (user_id) do update set
       preferred_time_slots = excluded.preferred_time_slots,
       sessions_per_week_goal = excluded.sessions_per_week_goal,
       preferred_days = excluded.preferred_days,
       updated_at = now()
     returning *`,
    [
      userId, 
      prefs.preferred_time_slots ?? prefs.preferred_time ?? null, 
      prefs.sessions_per_week_goal ?? prefs.sessions_per_week ?? null, 
      prefs.preferred_days ?? prefs.day_slots ?? null
    ]
  )
  return rows[0]
}

module.exports = { getPreferences, upsertPreferences }
