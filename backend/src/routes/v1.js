const express = require('express')
const { healthRouter } = require('../modules/health/health.routes')
const { sportsRouter } = require('../modules/sports/sports.routes')

const router = express.Router()

router.use('/health', healthRouter)
router.use('/sports', sportsRouter)

module.exports = { v1Router: router }
