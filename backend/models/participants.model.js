const { query } = require('../db/client')

async function joinSession({ sessionId, userId }) {
  const sql = `
    insert into public.session_participants (session_id, user_id, role)
    values ($1, $2, 'member')
    on conflict (session_id, user_id) do nothing
    returning session_id, user_id, role, joined_at
  `
  const { rows } = await query(sql, [sessionId, userId])
  return rows[0] || null
}

async function leaveSession({ sessionId, userId }) {
  await query('delete from public.session_participants where session_id = $1 and user_id = $2', [
    sessionId,
    userId,
  ])
}

async function getParticipant({ sessionId, userId }) {
  const { rows } = await query(
    'select session_id, user_id, role, joined_at from public.session_participants where session_id = $1 and user_id = $2',
    [sessionId, userId]
  )
  return rows[0] || null
}

async function listParticipantsBySession(sessionId, { limit = 100, offset = 0 } = {}) {
  const { rows } = await query(
    `select session_id, user_id, role, joined_at
     from public.session_participants
     where session_id = $1
     order by joined_at asc
     limit $2 offset $3`,
    [sessionId, limit, offset]
  )
  return rows
}

async function listParticipantsWithDetails(sessionId) {
  const { rows } = await query(
    `select 
       sp.user_id as id,
       sp.role,
       sp.joined_at,
       u.display_name,
       u.avatar_url,
       u.username
     from public.session_participants sp
     join public.users u on u.id = sp.user_id
     where sp.session_id = $1
     order by sp.joined_at asc`,
    [sessionId]
  )
  return rows
}

async function countParticipantsBySession(sessionId) {
  const { rows } = await query(
    'select count(*)::int as count from public.session_participants where session_id = $1',
    [sessionId]
  )
  return rows[0]?.count ?? 0
}

module.exports = {
  joinSession,
  leaveSession,
  getParticipant,
  listParticipantsBySession,
  countParticipantsBySession,
  listParticipantsWithDetails,
}
