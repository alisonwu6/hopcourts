const notificationsModel = require('../../../models/notifications.model')
const { sendPushToUser } = require('../push/push.service')

async function createNotification(payload) {
  try {
    const result = await notificationsModel.createNotification(payload)
    // Fire push notification alongside the in-app notification; never block main flow
    sendPushToUser(payload.recipient_user_id, {
      title: payload.title,
      body: payload.message,
      url: payload.metadata?.deep_link || '/',
    }).catch(err => console.error('Push notification failed', err))
    return result
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
