const express = require('express')
const { handleListSports } = require('../../modules/sports/sports.controller')

const router = express.Router()

router.get('/', handleListSports)

module.exports = { sportsRouter: router }
