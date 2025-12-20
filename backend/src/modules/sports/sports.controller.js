const { ok } = require('../../lib/respond')
const { Errors } = require('../../lib/errors')
const { listSports } = require('./sports.service')

async function handleListSports(req, res, next) {
  try {
    const lang = (req.query.lang || 'zh').toString()
    if (!['zh', 'en'].includes(lang)) {
      throw Errors.validation('lang must be zh or en', { lang })
    }
    const data = await listSports({ lang })
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

module.exports = { handleListSports }
