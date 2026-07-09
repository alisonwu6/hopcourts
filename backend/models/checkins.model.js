const { query } = require('../src/lib/db')

async function createCheckIn({ sessionId, userId }) {
  const { rows } = await query(
    `insert into public.check_ins (
      session_id, user_id, checked_in_at, is_verified
    ) values (
      $1, $2, now(), true
    )
    returning id, session_id, user_id, checked_in_at, is_verified`,
    [sessionId, userId]
  )
  return rows[0]
}

async function getLatestCheckIn({ sessionId, userId }) {
  const { rows } = await query(
    `select id, session_id, user_id, location_lat as lat, location_lng as lng, checked_in_at, is_verified
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
    `select id, session_id, user_id, location_lat as lat, location_lng as lng, checked_in_at, is_verified
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
