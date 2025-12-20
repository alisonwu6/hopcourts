const express = require('express')
const { handleListSessions, handleGetSession } = require('../../modules/sessions/sessions.controller')

const router = express.Router()

router.get('/', handleListSessions)
router.get('/:id', handleGetSession)

module.exports = { sessionsRouter: router }
