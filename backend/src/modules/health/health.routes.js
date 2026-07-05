const express = require('express')
const { ok } = require('../../lib/respond')
const { getPool } = require('../../lib/db')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    await getPool().query('SELECT 1')
    return ok(res, { status: 'ok' })
  } catch {
    return res.status(503).json({ ok: false, error: { code: 'DB_UNAVAILABLE', message: 'Database unreachable' } })
  }
})

module.exports = { healthRouter: router }
