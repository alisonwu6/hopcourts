const express = require('express')
const { handleCheckIn, handleOnTheWay } = require('./checkins.controller')
const { verifyToken } = require('../../middleware/verifyToken')

const router = express.Router()

router.post('/sessions/:sessionId/check-in', verifyToken, handleCheckIn)
router.post('/sessions/:sessionId/on-the-way', verifyToken, handleOnTheWay)

module.exports = { checkinsRouter: router }
