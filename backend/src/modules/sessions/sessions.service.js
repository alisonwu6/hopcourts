const { Errors } = require('../../lib/errors')
const sessionsModel = require('../../../models/sessions.model')
const participantsModel = require('../../../models/participants.model')

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

async function getSessionDetail(sessionId, userId) {
  const session = await getSessionById(sessionId)
  if (!session) {
    throw Errors.notFound('Session not found')
  }

  const meta = await buildSessionMeta({ sessionId, session, userId })

  return { session, meta }
}

async function buildSessionMeta({ sessionId, session, userId } = {}) {
  const sessionData = session || (await sessionsModel.getSessionById(sessionId))
  const participantCount = await sessionsModel.getParticipantCount(sessionId)
  const isJoined = userId
    ? Boolean(await participantsModel.getParticipant({ sessionId, userId }))
    : false
  const spotsLeft =
    sessionData?.max_people == null
      ? null
      : Math.max(sessionData.max_people - participantCount, 0)

  return {
    participant_count: participantCount,
    spots_left: spotsLeft,
    is_joined: isJoined,
  }
}

async function joinSession({ sessionId, userId }) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const session = await getSessionById(sessionId)
  if (!session) throw Errors.notFound('Session not found')
  if (session.status !== 'published') throw Errors.forbidden('Session is not open for joining')

  const metaBefore = await buildSessionMeta({ sessionId, session, userId })
  const isFull =
    session.max_people != null && metaBefore.participant_count >= session.max_people
  if (isFull && !metaBefore.is_joined) {
    throw Errors.forbidden('Session is full')
  }

  await participantsModel.joinSession({ sessionId, userId })
  const meta = await buildSessionMeta({ sessionId, session, userId })

  return {
    session_id: sessionId,
    joined: true,
    meta,
  }
}

async function leaveSession({ sessionId, userId }) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const session = await getSessionById(sessionId)
  if (!session) throw Errors.notFound('Session not found')

  await participantsModel.leaveSession({ sessionId, userId })
  const meta = await buildSessionMeta({ sessionId, session, userId })

  return {
    session_id: sessionId,
    joined: false,
    meta,
  }
}

module.exports = {
  listSessions,
  getSessionById,
  getSessionDetail,
  buildListParams,
  joinSession,
  leaveSession,
}
