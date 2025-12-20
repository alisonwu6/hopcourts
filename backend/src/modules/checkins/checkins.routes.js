const express = require('express')
const { handleCheckIn } = require('./checkins.controller')

const router = express.Router()

router.post('/sessions/:sessionId/check-in', handleCheckIn)

module.exports = { checkinsRouter: router }
