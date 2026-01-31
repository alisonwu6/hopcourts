const express = require('express')
const { healthRouter } = require('../modules/health/health.routes')
const { sportsRouter } = require('./v1/sports.routes')
const { sessionsRouter } = require('./v1/sessions.routes')
const { checkinsRouter } = require('../modules/checkins/checkins.routes')
const { dictionariesRouter } = require('./v1/dictionaries.routes')
const { profileRouter } = require('./v1/profile.routes')
const { venuesRouter } = require('../modules/venues/venues.routes')

const router = express.Router()

router.use('/health', healthRouter)
router.use('/sports', sportsRouter)
router.use('/sessions', sessionsRouter)
router.use('/', checkinsRouter)
router.use('/', dictionariesRouter)
router.use('/', profileRouter)
router.use('/venues', venuesRouter)

module.exports = { v1Router: router }
