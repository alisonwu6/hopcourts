const express = require('express')
const { listSports } = require('../controllers/sportsController')

const router = express.Router()

router.get('/sports', listSports)

module.exports = router
