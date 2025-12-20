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

async function listSessions(params = {}) {
  try {
    return await sessionsModel.listUpcomingSessions(params)
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

function buildListParams(query) {
  return {
    sportKey: query.sport ? String(query.sport) : undefined,
    city: query.city ? String(query.city) : undefined,
    from: parseDate(query.from),
    to: parseDate(query.to),
    limit: parseNumber(query.limit, 50),
    offset: parseNumber(query.offset, 0),
  }
}

module.exports = {
  listSessions,
  getSessionById,
  buildListParams,
}
