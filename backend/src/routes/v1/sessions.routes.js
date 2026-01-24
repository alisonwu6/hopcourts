const express = require('express')
const {
  handleListSessions,
  handleCreateSession,
  handleGetSession,
  handleJoinSession,
  handleLeaveSession,
  handleListMySessions,
  handleUpdateSession,
  handleDeleteSession,
} = require('../../modules/sessions/sessions.controller')

const router = express.Router()

router.get('/my', handleListMySessions)
router.get('/', handleListSessions)
router.post('/', handleCreateSession)
router.get('/:id', handleGetSession)
router.put('/:id', handleUpdateSession)
router.delete('/:id', handleDeleteSession)
// For leave, typically DELETE /id/join or POST /id/leave
// Frontend uses POST /id/leave
router.post('/:id/leave', handleLeaveSession)
router.post('/:id/join', handleJoinSession)
router.delete('/:id/join', handleLeaveSession) // Keep for compatibility if needed

module.exports = { sessionsRouter: router }
