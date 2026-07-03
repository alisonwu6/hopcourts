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
    const { lat, lng } = req.body || {}
    const userId = resolveUserId(req)

    if (lat === undefined || lng === undefined) {
      throw Errors.validation('lat and lng are required')
    }

    const latNum = Number(lat)
    const lngNum = Number(lng)
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      throw Errors.validation('lat and lng must be numbers')
    }

    const data = await checkInToSession({
      sessionId,
      userId,
      lat: latNum,
      lng: lngNum,
      now: new Date(),
    })
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
