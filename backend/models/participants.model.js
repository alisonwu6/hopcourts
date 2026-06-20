const { query } = require('../src/lib/db')

async function joinSession({ sessionId, userId, role = 'player' }) {
  const sql = `
    insert into public.session_participants (session_id, user_id, role)
    values ($1, $2, $3)
    on conflict (session_id, user_id) do nothing
    returning session_id, user_id, role, joined_at
  `
  const { rows } = await query(sql, [sessionId, userId, role])
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
        sp.on_the_way_at,
        u.display_name,
        u.avatar_url,
        u.username,
        u.is_anonymous,
        c.checked_in_at
      from public.session_participants sp
      join public.users u on u.id = sp.user_id
      left join public.check_ins c on c.session_id = sp.session_id and c.user_id = sp.user_id
      where sp.session_id = $1
      order by sp.joined_at asc`,
    [sessionId]
  )
  return rows
}

async function setOnTheWay({ sessionId, userId }) {
  const { rows } = await query(
    `update public.session_participants
      set on_the_way_at = coalesce(on_the_way_at, now())
      where session_id = $1 and user_id = $2
      returning on_the_way_at`,
    [sessionId, userId]
  )
  return rows[0] || null
}

async function getOnTheWay({ sessionId, userId }) {
  const { rows } = await query(
    `select on_the_way_at from public.session_participants
      where session_id = $1 and user_id = $2`,
    [sessionId, userId]
  )
  return rows[0]?.on_the_way_at || null
}

async function countParticipantsBySession(sessionId) {
  const { rows } = await query(
    'select count(*)::int as count from public.session_participants where session_id = $1',
    [sessionId]
  )
  return rows[0]?.count ?? 0
}

async function countTeammates(userId) {
  // Mirrors listTeammates: both parties checked in, session has finished.
  const sql = `
    select count(distinct ci.user_id)::int as count
    from public.check_ins ci
    join public.sessions s on s.id = ci.session_id
    where ci.session_id in (
      select session_id from public.check_ins where user_id = $1
    )
      and ci.user_id != $1
      and coalesce(s.ends_at, s.starts_at) <= now()
  `
  const { rows } = await query(sql, [userId])
  return rows[0]?.count ?? 0
}

async function countJoinedSessions(userId) {
  const { rows } = await query(
    `select count(distinct sp.session_id)::int as count
      from public.session_participants sp
      join public.sessions s on s.id = sp.session_id
      where sp.user_id = $1
        and s.status not in ('draft', 'cancelled')
        and s.host_user_id != $1`,
    [userId]
  )
  return rows[0]?.count ?? 0
}

module.exports = {
  joinSession,
  leaveSession,
  getParticipant,
  listParticipantsBySession,
  countParticipantsBySession,
  countTeammates,
  listTeammates,
  listParticipantsWithDetails,
  countJoinedSessions,
  setOnTheWay,
  getOnTheWay,
}

async function listTeammates(userId, { limit = 50, offset = 0 } = {}) {
  // A "mate" is someone we actually played with — same session, both checked in,
  // and the session has finished (ends_at in the past, or starts_at if ends_at is null).
  const sql = `
    select
      u.id,
      u.display_name,
      u.username,
      u.avatar_url,
      u.city_key,
      u.is_anonymous,
      count(distinct s.id)::int as sessions_count,
      max(s.starts_at) as last_played_at,
      array_agg(distinct s.sport_key) as shared_sports
    from public.session_participants me
    join public.check_ins me_ci
      on me_ci.session_id = me.session_id and me_ci.user_id = me.user_id
    join public.session_participants other
      on me.session_id = other.session_id
    join public.check_ins other_ci
      on other_ci.session_id = other.session_id and other_ci.user_id = other.user_id
    join public.users u on u.id = other.user_id
    join public.sessions s on s.id = me.session_id
    where me.user_id = $1
      and other.user_id != $1
      and coalesce(s.ends_at, s.starts_at) <= now()
    group by u.id
    order by last_played_at desc
    limit $2 offset $3
  `
  const { rows } = await query(sql, [userId, limit, offset])
  return rows
}
