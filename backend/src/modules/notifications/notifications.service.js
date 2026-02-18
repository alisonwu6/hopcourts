const notificationsModel = require('../../../models/notifications.model')

async function createNotification(payload) {
  try {
    return await notificationsModel.createNotification(payload)
  } catch (err) {
    console.error('Failed to create notification', err)
    // Do not throw, main flow should continue
    return null
  }
}

async function listNotifications(userId, options) {
  return await notificationsModel.listNotifications(userId, options)
}

async function countUnread(userId) {
  return await notificationsModel.countUnread(userId)
}

async function markRead(userId, notificationId) {
  return await notificationsModel.markRead(userId, notificationId)
}

async function markAllRead(userId) {
  return await notificationsModel.markAllRead(userId)
}

module.exports = {
  createNotification,
  listNotifications,
  countUnread,
  markRead,
  markAllRead
}
