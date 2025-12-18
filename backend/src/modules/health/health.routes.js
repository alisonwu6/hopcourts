const express = require('express')
const { ok } = require('../../lib/respond')

const router = express.Router()

router.get('/', (req, res) => {
  return ok(res, { status: 'ok' })
})

module.exports = { healthRouter: router }
