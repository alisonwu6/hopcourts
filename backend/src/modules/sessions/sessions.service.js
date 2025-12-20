const { Errors } = require('../../lib/errors')
const sessionsModel = require('../../../models/sessions.model')

function parseNumber(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function parseDate(value) {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function buildListParams(query) {
  const limitRaw = parseNumber(query.limit, 20)
  const limit = Math.min(Math.max(limitRaw, 1), 50)
  const offset = Math.max(parseNumber(query.offset, 0), 0)

  return {
    sportKey: query.sport_key || query.sport ? String(query.sport_key || query.sport) : undefined,
    city: query.city ? String(query.city) : undefined,
    from: parseDate(query.from),
    to: parseDate(query.to),
    limit,
    offset,
  }
}

async function listSessions(params = {}) {
  try {
    const sessions = await sessionsModel.listUpcomingSessions(params)
    return {
      sessions,
      page: {
        limit: params.limit,
        offset: params.offset,
        has_more: sessions.length === params.limit,
      },
    }
  } catch (err) {
    throw Errors.internal('Failed to list sessions', { message: err.message })
  }
}

async function getSessionById(sessionId) {
  try {
    return await sessionsModel.getSessionById(sessionId)
  } catch (err) {
    throw Errors.internal('Failed to fetch session', { message: err.message })
  }
}

async function getSessionDetail(sessionId) {
  const session = await getSessionById(sessionId)
  if (!session) {
    throw Errors.notFound('Session not found')
  }
  const participantCount = await sessionsModel.getParticipantCount(sessionId)
  const spotsLeft =
    session.max_people == null ? null : Math.max(session.max_people - participantCount, 0)

  return {
    session,
    meta: {
      participant_count: participantCount,
      spots_left: spotsLeft,
    },
  }
}

module.exports = {
  listSessions,
  getSessionById,
  getSessionDetail,
  buildListParams,
}
