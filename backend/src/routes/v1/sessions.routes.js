const express = require('express')
const {
  handleListSessions,
  handleGetSession,
  handleJoinSession,
  handleLeaveSession,
} = require('../../modules/sessions/sessions.controller')

const router = express.Router()

router.get('/', handleListSessions)
router.get('/:id', handleGetSession)
router.post('/:id/join', handleJoinSession)
router.delete('/:id/join', handleLeaveSession)

module.exports = { sessionsRouter: router }
