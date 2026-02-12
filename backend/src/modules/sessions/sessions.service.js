const { Errors } = require('../../lib/errors')
const sessionsModel = require('../../../models/sessions.model')
const participantsModel = require('../../../models/participants.model')
const checkinsModel = require('../../../models/checkins.model')
const usersModel = require('../../../models/users.model')
const { createSession: createSessionModel } = require('../../../models/sessions.model')
const { resolveVenue } = require('../venues/venues.service')

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
      items: sessions,
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

async function listMySessions({ userId, type = 'upcoming', limit, offset }) {
  try {
    let sessions = []
    if (type === 'history') {
      sessions = await sessionsModel.listMyHistorySessions({ userId, limit, offset })
    } else {
      sessions = await sessionsModel.listMyUpcomingSessions({ userId, limit, offset })
    }
    
    return {
      items: sessions,
      page: {
        limit,
        offset,
        has_more: sessions.length === limit,
      },
    }
  } catch (err) {
    throw Errors.internal('Failed to list my sessions', { message: err.message })
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

  const [meta, host, participants] = await Promise.all([
    buildSessionMeta({ sessionId, session, userId }),
    usersModel.getUserById(session.host_user_id),
    participantsModel.listParticipantsWithDetails(sessionId)
  ])

  return { 
    session, 
    meta, 
    host: host ? {
      id: host.id,
      display_name: host.display_name,
      username: host.username,
      avatar_url: host.avatar_url,
      bio: host.bio
    } : null, 
    participants 
  }
}

async function buildSessionMeta({ sessionId, session, userId } = {}) {
  const sessionData = session || (await sessionsModel.getSessionById(sessionId))
  const participantCount = await sessionsModel.getParticipantCount(sessionId)
  const isJoined = userId
    ? Boolean(await participantsModel.getParticipant({ sessionId, userId }))
    : false
  const hasCheckedIn = userId
    ? await checkinsModel.hasCheckedIn({ sessionId, userId })
    : false
  const spotsLeft =
    sessionData?.max_people == null
      ? null
      : Math.max(sessionData.max_people - participantCount, 0)

  return {
    participant_count: participantCount,
    spots_left: spotsLeft,
    is_joined: isJoined,
    viewer_has_joined: isJoined,
    viewer_has_checked_in: hasCheckedIn,
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

async function createSession(input) {
  if (!input.userId) throw Errors.unauthenticated('User id is required')
  if (!input.sportKey) throw Errors.validation('sport_key is required')
  if (!input.startAt) throw Errors.validation('starts_at is required')
  if (!input.placeName) throw Errors.validation('place_name is required')

  const allowedSkill = ['any', 'beginner', 'intermediate', 'advanced']
  const allowedGender = ['mixed', 'female', 'male']

  if (input.skillLevel && !allowedSkill.includes(input.skillLevel)) {
    throw Errors.validation('invalid skill_level', { skill_level: input.skillLevel })
  }
  if (input.gender && !allowedGender.includes(input.gender)) {
    throw Errors.validation('invalid gender', { gender: input.gender })
  }
  if (input.photos && (!Array.isArray(input.photos) || input.photos.length > 3)) {
    throw Errors.validation('photos must be an array with at most 3 items')
  }

  // Cost validation
  if (input.isFree === false) {
    if (!input.price || Number(input.price) <= 0) {
      throw Errors.validation('Price is required for paid sessions')
    }
    if (!input.priceNote) {
      throw Errors.validation('Price note is required for paid sessions')
    }
  }

  // Resolve Venue ID
  let venueId = null
  // Only attempt resolution if we have valid coordinates
  if (input.lat && input.lng && input.lat !== 0 && input.lng !== 0) {
    try {
      venueId = await resolveVenue({
        lat: Number(input.lat),
        lng: Number(input.lng),
        name: input.placeName,
        address: input.address,
        source: input.locationSource
      })
    } catch (err) {
      console.error('Venue resolution failed', err)
      // We process without venue_id if resolution fails, or throw? 
      // For now, log and proceed, event will be created without venue link or we fail safe.
      // Better to proceed so user isn't blocked.
    }
  }

  const payload = {
    hostUserId: input.userId,
    sportKey: input.sportKey,
    venueId, // Add resolved venue ID
    title: input.title ?? null,
    description: input.description ?? null,
    startAt: new Date(input.startAt),
    endAt: input.endAt ? new Date(input.endAt) : null,
    locationName: input.placeName,
    address: input.address ?? null,
    lat: input.lat ?? 0,
    lng: input.lng ?? 0,
    checkinRadiusM: input.checkinRadiusM ?? 100,
    checkinOpenMinsBefore: input.checkinOpenMinsBefore ?? 20,
    checkinCloseMinsAfter: input.checkinCloseMinsAfter ?? 20,
    minPeople: input.minPeople ?? 3,
    maxPeople: input.maxPeople ?? input.capacity ?? null,
    status: input.status ?? 'published',
    visibility: input.visibility ?? 'public',
    skillLevel: input.skillLevel ?? 'any',
    gender: input.gender ?? 'mixed',
    photos: input.photos ?? null,
    isFree: input.isFree ?? true,
    price: input.price ?? null,
    locationSource: input.locationSource,
    priceNote: input.priceNote ?? null,
  }

  const session = await createSessionModel(payload)
  
  // Auto-join the creator as organizer
  if (session && session.id) {
    await participantsModel.joinSession({ 
      sessionId: session.id, 
      userId: input.userId,
      role: 'organizer'
    })
  }

  return session
}

async function updateSession(sessionId, input) {
  if (!input.userId) throw Errors.unauthenticated('User id is required')
  
  const existing = await getSessionById(sessionId)
  if (!existing) throw Errors.notFound('Session not found')
  if (existing.host_user_id !== input.userId) {
    throw Errors.forbidden('Only host can update session')
  }

  const allowedSkill = ['any', 'beginner', 'intermediate', 'advanced']
  const allowedGender = ['mixed', 'female', 'male']

  if (input.skillLevel && !allowedSkill.includes(input.skillLevel)) {
    throw Errors.validation('invalid skill_level', { skill_level: input.skillLevel })
  }
  if (input.gender && !allowedGender.includes(input.gender)) {
    throw Errors.validation('invalid gender', { gender: input.gender })
  }
  if (input.photos && (!Array.isArray(input.photos) || input.photos.length > 3)) {
    throw Errors.validation('photos must be an array with at most 3 items')
  }

  const patch = {
    title: input.title,
    description: input.description,
    startAt: input.startAt ? new Date(input.startAt) : undefined,
    endAt: input.endAt ? new Date(input.endAt) : undefined,
    locationName: input.placeName,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    checkinRadiusM: input.checkinRadiusM,
    checkinOpenMinsBefore: input.checkinOpenMinsBefore,
    checkinCloseMinsAfter: input.checkinCloseMinsAfter,
    minPeople: input.minPeople,
    maxPeople: input.maxPeople ?? input.capacity,
    status: input.status,
    visibility: input.visibility,
    skillLevel: input.skillLevel,
    gender: input.gender,
    photos: input.photos,
    isFree: input.isFree,
    price: input.price,
    priceNote: input.priceNote,
  }

  return sessionsModel.updateSession(sessionId, patch)
}

async function deleteSession(sessionId, userId) {
  if (!userId) throw Errors.unauthenticated('User id is required')

  const existing = await getSessionById(sessionId)
  if (!existing) throw Errors.notFound('Session not found')
  if (existing.host_user_id !== userId) {
    throw Errors.forbidden('Only host can delete session')
  }

  return sessionsModel.deleteSession(sessionId)
}

module.exports = {
  listSessions,
  getSessionById,
  getSessionDetail,
  buildListParams,
  listMySessions,
  joinSession,
  leaveSession,
  createSession,
  updateSession,
  deleteSession,
}
