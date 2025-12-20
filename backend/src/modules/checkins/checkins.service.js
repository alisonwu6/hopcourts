const { AppError } = require('../../lib/errors')
const sessionsModel = require('../../../models/sessions.model')
const checkinsModel = require('../../../models/checkins.model')
const { haversineMeters } = require('../../utils/geo')

function createError(code, message, status = 400, details = {}) {
  return new AppError({ code, message, status, details })
}

function addMinutes(date, mins) {
  return new Date(date.getTime() + mins * 60 * 1000)
}

function ensureNumber(value, field) {
  const n = Number(value)
  if (!Number.isFinite(n)) throw createError('INVALID_BODY', `${field} must be a number`, 422)
  return n
}

async function checkInToSession({ sessionId, userId, lat, lng, now = new Date() }) {
  if (!userId) throw createError('UNAUTHENTICATED', 'User id is required', 401)
  const session = await sessionsModel.getSessionById(sessionId)
  if (!session) throw createError('SESSION_NOT_FOUND', 'Session not found', 404)
  if (session.status && session.status !== 'published') {
    throw createError('SESSION_NOT_OPEN', 'Session is not open for check-in', 403, {
      status: session.status,
    })
  }

  const startsAt = new Date(session.starts_at)
  const endsAt = session.ends_at ? new Date(session.ends_at) : null
  if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt?.getTime())) {
    throw createError('INVALID_SESSION', 'Session start/end time is invalid', 400)
  }

  const openMins = Number(session.checkin_open_mins_before ?? 0)
  const closeMins = Number(session.checkin_close_mins_after ?? 0)
  const opensAt = addMinutes(startsAt, -openMins)
  const closesAt = addMinutes(endsAt, closeMins)

  const nowTs = now instanceof Date ? now : new Date(now)
  if (nowTs < opensAt || nowTs > closesAt) {
    throw createError('CHECKIN_OUTSIDE_TIME_WINDOW', 'Not within check-in time window', 403, {
      opens_at: opensAt.toISOString(),
      closes_at: closesAt.toISOString(),
      now: nowTs.toISOString(),
    })
  }

  const sessionLat = ensureNumber(session.lat, 'session.lat')
  const sessionLng = ensureNumber(session.lng, 'session.lng')
  const radiusM = ensureNumber(session.checkin_radius_m, 'checkin_radius_m')
  if (radiusM <= 0) {
    throw createError('INVALID_SESSION', 'Session check-in radius is invalid', 400)
  }

  const distanceM = Math.round(haversineMeters(sessionLat, sessionLng, lat, lng))
  if (distanceM > radiusM) {
    throw createError('CHECKIN_OUTSIDE_RADIUS', 'Too far from check-in location', 403, {
      distance_m: distanceM,
      radius_m: radiusM,
    })
  }

  const existing = await checkinsModel.getLatestCheckIn({ sessionId, userId })
  if (existing) return { checkIn: existing }

  const checkIn = await checkinsModel.createCheckIn({
    sessionId,
    userId,
    lat,
    lng,
    checkedInAt: nowTs,
    distanceM,
    status: 'ok',
  })

  return { checkIn }
}

module.exports = { checkInToSession }
