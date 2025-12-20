const { ok } = require('../../lib/respond')
const { Errors } = require('../../lib/errors')
const { listSessions, getSessionById, buildListParams } = require('./sessions.service')

async function handleListSessions(req, res, next) {
  try {
    const params = buildListParams(req.query || {})
    const items = await listSessions(params)
    return ok(res, { items })
  } catch (err) {
    next(err)
  }
}

async function handleGetSession(req, res, next) {
  try {
    const { id } = req.params
    if (!id) throw Errors.validation('session id required')
    const session = await getSessionById(id)
    if (!session) throw Errors.notFound('Session not found')
    return ok(res, { session })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  handleListSessions,
  handleGetSession,
}
