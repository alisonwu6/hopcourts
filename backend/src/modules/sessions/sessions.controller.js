const { ok } = require('../../lib/respond')
const { Errors } = require('../../lib/errors')
const {
  listSessions,
  getSessionDetail,
  buildListParams,
  joinSession,
  leaveSession,
} = require('./sessions.service')

function resolveUserId(req) {
  return (
    req.userId ||
    req.authUser?.id ||
    req.user?.id ||
    req.headers['x-user-id'] ||
    req.headers['x-userid']
  )
}

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
    const userId = resolveUserId(req)
    const data = await getSessionDetail(id, userId)
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleJoinSession(req, res, next) {
  try {
    const { id } = req.params
    if (!id) throw Errors.validation('session id required')
    const userId = resolveUserId(req)
    const data = await joinSession({ sessionId: id, userId })
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleLeaveSession(req, res, next) {
  try {
    const { id } = req.params
    if (!id) throw Errors.validation('session id required')
    const userId = resolveUserId(req)
    const data = await leaveSession({ sessionId: id, userId })
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  handleListSessions,
  handleGetSession,
  handleJoinSession,
  handleLeaveSession,
}
