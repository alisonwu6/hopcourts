const { ok } = require('../../lib/respond')
const { Errors } = require('../../lib/errors')
const {
  listSessions,
  createSession,
  getSessionDetail,
  buildListParams,
  joinSession,
  leaveSession,
  listMySessions,
  updateSession,
  deleteSession,
} = require('./sessions.service')

function resolveUserId(req) {
  return req.userId || req.authUser?.id || req.user?.id
}

async function handleListSessions(req, res, next) {
  try {
    const params = buildListParams(req.query || {})
    const type = req.query.type || 'upcoming'
    const userId = resolveUserId(req)

    if ((type === 'interests' || type === 'relations') && !userId) {
      throw Errors.unauthenticated('Authentication required for this feed type')
    }

    const data = await listSessions({ ...params, type, userId })
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

async function handleCreateSession(req, res, next) {
  try {
    const userId = resolveUserId(req)
    if (!userId) throw Errors.unauthenticated('User id required')
    const body = req.body || {}
    const loc = body.location || {}

    const session = await createSession({
      userId,
      sportKey: body.sport_key || body.sportKey,
      title: body.title,
      description: body.description,
      startAt: body.starts_at || body.startAt,
      endAt: body.ends_at || body.endAt,
      // Support NEW nested location object (preferred) OR legacy flat fields
      placeName: loc.name || body.place_name || body.locationName || body.location_name,
      address: loc.address || body.address,
      lat: loc.lat ?? body.lat,
      lng: loc.lng ?? body.lng,
      locationSource: body.location_source || loc.source, // Support explicit location_source or nested source
      checkinRadiusM: body.checkin_radius_m ?? body.checkinRadiusM,
      checkinOpenMinsBefore: body.checkin_open_mins_before ?? body.checkinOpenMinsBefore,
      checkinCloseMinsAfter: body.checkin_close_mins_after ?? body.checkinCloseMinsAfter,
      minPeople: body.min_people ?? body.minPeople,
      maxPeople: body.max_people ?? body.maxPeople ?? body.capacity,
      status: body.status,
      visibility: body.visibility,
      skillLevel: body.skill_level || body.skillLevel,
      gender: body.gender,
      photos: Array.isArray(body.photos) ? body.photos : undefined,
      isFree: body.is_free ?? body.isFree,
      priceTotal: body.price_total ?? body.priceTotal,
      pricePerPerson: body.price_per_person ?? body.pricePerPerson,
      priceMode: body.price_mode ?? body.priceMode,
      priceNote: body.price_note ?? body.priceNote,
    })
    return ok(res, { session })
  } catch (err) {
    next(err)
  }
}

async function handleListMySessions(req, res, next) {
  try {
    const userId = resolveUserId(req)
    if (!userId) throw Errors.unauthenticated('User id required')
    const params = buildListParams(req.query || {})
    const type = req.query.type || 'upcoming'
    const role = req.query.role ? String(req.query.role) : undefined
    const time = req.query.time ? String(req.query.time) : undefined
    const data = await listMySessions({
      userId,
      type,
      role,
      time,
      limit: params.limit,
      offset: params.offset,
    })
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
  handleCreateSession,
  handleListMySessions,
  handleUpdateSession,
  handleDeleteSession,
}

async function handleUpdateSession(req, res, next) {
  try {
    const { id } = req.params
    if (!id) throw Errors.validation('session id required')
    
    const userId = resolveUserId(req)
    if (!userId) throw Errors.unauthenticated('User id required')
    
    const body = req.body || {}
    const session = await updateSession(id, {
      userId,
      sportKey: body.sport_key || body.sportKey,
      title: body.title,
      description: body.description,
      startAt: body.starts_at || body.startAt,
      endAt: body.ends_at || body.endAt,
      placeName: body.place_name ?? body.locationName ?? body.location_name,
      address: body.address,
      lat: body.lat,
      lng: body.lng,
      locationSource: body.location_source ?? body.locationSource,
      checkinRadiusM: body.checkin_radius_m ?? body.checkinRadiusM,
      checkinOpenMinsBefore: body.checkin_open_mins_before ?? body.checkinOpenMinsBefore,
      checkinCloseMinsAfter: body.checkin_close_mins_after ?? body.checkinCloseMinsAfter,
      minPeople: body.min_people ?? body.minPeople,
      maxPeople: body.max_people ?? body.maxPeople ?? body.capacity,
      status: body.status,
      visibility: body.visibility,
      skillLevel: body.skill_level || body.skillLevel,
      gender: body.gender,
      photos: Array.isArray(body.photos) ? body.photos : undefined,
      isFree: body.is_free ?? body.isFree,
      priceTotal: body.price_total ?? body.priceTotal,
      pricePerPerson: body.price_per_person ?? body.pricePerPerson,
      priceMode: body.price_mode ?? body.priceMode,
      priceNote: body.price_note ?? body.priceNote,
    })
    return ok(res, { session })
  } catch (err) {
    next(err)
  }
}

async function handleDeleteSession(req, res, next) {
  try {
    const { id } = req.params
    if (!id) throw Errors.validation('session id required')
    
    const userId = resolveUserId(req)
    if (!userId) throw Errors.unauthenticated('User id required')
    
    await deleteSession(id, userId)
    return ok(res, { deleted: true, id })
  } catch (err) {
    next(err)
  }
}
