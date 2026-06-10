const { query } = require('../src/lib/db')

async function addBookmark({ userId, sessionId }) {
  const { rows } = await query(
    `insert into public.session_bookmarks (user_id, session_id)
     values ($1, $2)
     on conflict (user_id, session_id) do nothing
     returning id`,
    [userId, sessionId]
  )
  return rows[0] || null
}

async function removeBookmark({ userId, sessionId }) {
  await query(
    `delete from public.session_bookmarks where user_id = $1 and session_id = $2`,
    [userId, sessionId]
  )
}

async function listBookmarkIds({ userId }) {
  const { rows } = await query(
    `select session_id from public.session_bookmarks where user_id = $1 order by created_at desc`,
    [userId]
  )
  return rows.map((r) => r.session_id)
}

async function isBookmarked({ userId, sessionId }) {
  const { rows } = await query(
    `select 1 from public.session_bookmarks where user_id = $1 and session_id = $2 limit 1`,
    [userId, sessionId]
  )
  return rows.length > 0
}

module.exports = { addBookmark, removeBookmark, listBookmarkIds, isBookmarked }
