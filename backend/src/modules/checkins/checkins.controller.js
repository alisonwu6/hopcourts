const { ok } = require('../../lib/respond')
const { Errors } = require('../../lib/errors')
const { checkInToSession } = require('./checkins.service')
const { signalOnTheWay } = require('./ontheway.service')

function resolveUserId(req) {
  return req.userId || req.authUser?.id || req.user?.id
}

async function handleCheckIn(req, res, next) {
  try {
    const { sessionId } = req.params
    const userId = resolveUserId(req)
    const data = await checkInToSession({ sessionId, userId, now: new Date() })
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleOnTheWay(req, res, next) {
  try {
    const { sessionId } = req.params
    const userId = resolveUserId(req)
    const data = await signalOnTheWay({ sessionId, userId, now: new Date() })
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

module.exports = { handleCheckIn, handleOnTheWay }
