const { query } = require('../db/client')

async function createCheckIn({ sessionId, userId, lat, lng, checkedInAt, distanceM, status }) {
  const { rows } = await query(
    `insert into public.check_ins (
      session_id, user_id, lat, lng, checked_in_at, distance_m, status
    ) values (
      $1, $2, $3, $4, coalesce($5, now()), $6, coalesce($7, 'ok')
    )
    returning id, session_id, user_id, lat, lng, checked_in_at, distance_m, status`,
    [sessionId, userId, lat, lng, checkedInAt ?? null, distanceM ?? null, status ?? null]
  )
  return rows[0]
}

async function getLatestCheckIn({ sessionId, userId }) {
  const { rows } = await query(
    `select id, session_id, user_id, lat, lng, checked_in_at, distance_m, status
     from public.check_ins
     where session_id = $1 and user_id = $2
     order by checked_in_at desc
     limit 1`,
    [sessionId, userId]
  )
  return rows[0] || null
}

async function listCheckInsBySession(sessionId) {
  const { rows } = await query(
    `select id, session_id, user_id, lat, lng, checked_in_at, distance_m, status
     from public.check_ins
     where session_id = $1
     order by checked_in_at desc`,
    [sessionId]
  )
  return rows
}

async function hasCheckedIn({ sessionId, userId }) {
  const { rows } = await query(
    'select 1 from public.check_ins where session_id = $1 and user_id = $2 limit 1',
    [sessionId, userId]
  )
  return rows.length > 0
}

module.exports = {
  createCheckIn,
  getLatestCheckIn,
  listCheckInsBySession,
  hasCheckedIn,
}
