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

const { verifyToken } = require('../../middleware/verifyToken')
const router = express.Router()

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return next()
  verifyToken(req, res, next)
}

router.get('/my', verifyToken, handleListMySessions)
router.get('/', optionalAuth, handleListSessions)
router.post('/', verifyToken, handleCreateSession)
router.get('/:id', handleGetSession)
router.put('/:id', verifyToken, handleUpdateSession)
router.delete('/:id', verifyToken, handleDeleteSession)
// For leave, typically DELETE /id/join or POST /id/leave
// Frontend uses POST /id/leave
router.post('/:id/leave', verifyToken, handleLeaveSession)
router.post('/:id/join', verifyToken, handleJoinSession)
router.delete('/:id/join', verifyToken, handleLeaveSession) // Keep for compatibility if needed

module.exports = { sessionsRouter: router }
