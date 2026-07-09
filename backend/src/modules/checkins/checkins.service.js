const { AppError } = require('../../lib/errors')
const sessionsModel = require('../../../models/sessions.model')
const checkinsModel = require('../../../models/checkins.model')

function createError(code, message, status = 400, details = {}) {
  return new AppError({ code, message, status, details })
}

async function checkInToSession({ sessionId, userId, now = new Date() }) {
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
  if (!Number.isFinite(startsAt.getTime())) {
    throw createError('INVALID_SESSION', 'Session start time is invalid', 400)
  }

  const openMins = Number(session.checkin_open_mins_before ?? 15)
  const opensAt = new Date(startsAt.getTime() - openMins * 60 * 1000)
  const nowTs = now instanceof Date ? now : new Date(now)

  if (nowTs < opensAt || (endsAt && nowTs > endsAt)) {
    throw createError('CHECKIN_OUTSIDE_TIME_WINDOW', 'Outside check-in window', 403, {
      opens_at: opensAt.toISOString(),
      ends_at: endsAt?.toISOString(),
      now: nowTs.toISOString(),
    })
  }

  const existing = await checkinsModel.getLatestCheckIn({ sessionId, userId })
  if (existing) return { checkIn: existing }

  const checkIn = await checkinsModel.createCheckIn({ sessionId, userId, checkedInAt: nowTs })

  return { checkIn }
}

module.exports = { checkInToSession }
