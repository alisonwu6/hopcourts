const express = require('express')
const {
  handleListSessions,
  handleCreateSession,
  handleGetSession,
  handleJoinSession,
  handleLeaveSession,
} = require('../../modules/sessions/sessions.controller')

const router = express.Router()

router.get('/', handleListSessions)
router.post('/', handleCreateSession)
router.get('/:id', handleGetSession)
router.post('/:id/join', handleJoinSession)
router.delete('/:id/join', handleLeaveSession)

module.exports = { sessionsRouter: router }
