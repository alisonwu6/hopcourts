const { ok } = require('../../lib/respond')
const { Errors } = require('../../lib/errors')
const { listSessions, getSessionDetail, buildListParams } = require('./sessions.service')

async function handleListSessions(req, res, next) {
  try {
    const params = buildListParams(req.query || {})
    const data = await listSessions(params)
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleGetSession(req, res, next) {
  try {
    const { id } = req.params
    if (!id) throw Errors.validation('session id required')
    const data = await getSessionDetail(id)
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  handleListSessions,
  handleGetSession,
}
