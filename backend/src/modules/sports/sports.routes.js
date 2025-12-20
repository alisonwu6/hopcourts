const express = require('express')
const { ok } = require('../../lib/respond')
const { Errors } = require('../../lib/errors')
const { listSports } = require('./sports.service')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const lang = (req.query.lang || 'zh').toString()
    if (!['zh', 'en'].includes(lang)) {
      throw Errors.validation('lang must be zh or en', { lang })
    }

    const data = await listSports({ lang })
    return ok(res, data)
  } catch (error) {
    next(error)
  }
})

module.exports = { sportsRouter: router }
