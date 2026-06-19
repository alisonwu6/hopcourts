const { AppError } = require('../../lib/errors')
const sessionsModel = require('../../../models/sessions.model')
const participantsModel = require('../../../models/participants.model')

async function signalOnTheWay({ sessionId, userId, now = new Date() }) {
  if (!userId) throw new AppError({ code: 'UNAUTHENTICATED', message: 'User id is required', status: 401 })

  const session = await sessionsModel.getSessionById(sessionId)
  if (!session) throw new AppError({ code: 'SESSION_NOT_FOUND', message: 'Session not found', status: 404 })

  const endsAt = session.ends_at ? new Date(session.ends_at) : null
  const nowTs = now instanceof Date ? now : new Date(now)

  if (endsAt && nowTs > endsAt) {
    throw new AppError({ code: 'SESSION_ENDED', message: 'Session has already ended', status: 403 })
  }

  const participant = await participantsModel.getParticipant({ sessionId, userId })
  if (!participant) {
    throw new AppError({ code: 'NOT_A_PARTICIPANT', message: 'You are not joined to this session', status: 403 })
  }

  const result = await participantsModel.setOnTheWay({ sessionId, userId })
  return { on_the_way_at: result?.on_the_way_at }
}

module.exports = { signalOnTheWay }
