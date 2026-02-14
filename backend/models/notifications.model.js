const { query } = require('../db/client')

async function createNotification(payload) {
  const sql = `
    insert into public.notifications 
      (recipient_user_id, actor_user_id, type, entity_type, entity_id, title, message, metadata, is_read)
    values ($1, $2, $3, $4, $5, $6, $7, $8, false)
    returning *
  `
  const { rows } = await query(sql, [
    payload.recipient_user_id,
    payload.actor_user_id || null,
    payload.type,
    payload.entity_type || null,
    payload.entity_id || null,
    payload.title,
    payload.message,
    payload.metadata || {}
  ])
  return rows[0]
}

async function listNotifications(userId, { limit = 20, offset = 0, unreadOnly = false }) {
  let whereClause = 'recipient_user_id = $1'
  if (unreadOnly) {
    whereClause += ' and is_read = false'
  }
  
  const sql = `
    select * 
    from public.notifications
    where ${whereClause}
    order by created_at desc
    limit $2 offset $3
  `
  const { rows } = await query(sql, [userId, limit, offset])
  return rows
}

async function countUnread(userId) {
  const sql = `
    select count(*)::int as count 
    from public.notifications 
    where recipient_user_id = $1 and is_read = false
  `
  const { rows } = await query(sql, [userId])
  return rows[0]?.count || 0
}

async function markRead(userId, notificationId) {
  const sql = `
    update public.notifications
    set is_read = true, read_at = now()
    where id = $1 and recipient_user_id = $2
    returning *
  `
  const { rows } = await query(sql, [notificationId, userId])
  return rows[0]
}

async function markAllRead(userId) {
  const sql = `
    update public.notifications
    set is_read = true, read_at = now()
    where recipient_user_id = $1 and is_read = false
  `
  const { rowCount } = await query(sql, [userId])
  return rowCount
}

module.exports = {
  createNotification,
  listNotifications,
  countUnread,
  markRead,
  markAllRead
}
