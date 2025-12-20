const express = require('express')
const { healthRouter } = require('../modules/health/health.routes')
const { sportsRouter } = require('./v1/sports.routes')
const { sessionsRouter } = require('./v1/sessions.routes')

const router = express.Router()

router.use('/health', healthRouter)
router.use('/sports', sportsRouter)
router.use('/sessions', sessionsRouter)

module.exports = { v1Router: router }
