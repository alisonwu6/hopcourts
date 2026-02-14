const notificationsService = require('./notifications.service')

async function listNotifications(req, res, next) {
  try {
    const { limit = 20, offset = 0, unread_only } = req.query
    const items = await notificationsService.listNotifications(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unread_only === 'true',
    })
    const unreadCount = await notificationsService.countUnread(req.user.id)
    
    res.json({
      ok: true,
      data: {
        items,
        unread_count: unreadCount,
        next_cursor: null // v1.0 pagination
      }
    })
  } catch (err) {
    next(err)
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params
    await notificationsService.markRead(req.user.id, id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationsService.markAllRead(req.user.id)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listNotifications,
  markRead,
  markAllRead
}
