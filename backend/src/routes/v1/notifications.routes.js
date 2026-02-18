const express = require('express')
const { verifyToken } = require('../../middleware/verifyToken')
const notificationsController = require('../../modules/notifications/notifications.controller')

const router = express.Router()

router.get('/', verifyToken, notificationsController.listNotifications)
router.patch('/:id/read', verifyToken, notificationsController.markRead)
router.patch('/read-all', verifyToken, notificationsController.markAllRead)

module.exports = { notificationsRouter: router }
