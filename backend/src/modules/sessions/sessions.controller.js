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
  return (
    req.userId ||
    req.authUser?.id ||
    req.user?.id ||
    req.headers['x-user-id'] ||
    req.headers['x-userid']
  )
}

async function handleListSessions(req, res, next) {
  try {
    const params = buildListParams(req.query || {})
    const data = await listSessions(params)
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
    const session = await createSession({
      userId,
      sportKey: body.sport_key || body.sportKey,
      title: body.title,
      notes: body.notes,
      startAt: body.starts_at || body.startAt,
      endAt: body.ends_at || body.endAt,
      placeName: body.place_name || body.locationName || body.location_name,
      address: body.address,
      lat: body.lat,
      lng: body.lng,
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
      price: body.price,
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
    // Need to pass type from query
    const type = req.query.type || 'upcoming'
    const data = await listMySessions({
      userId,
      type,
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
      notes: body.notes,
      startAt: body.starts_at || body.startAt,
      endAt: body.ends_at || body.endAt,
      placeName: body.place_name || body.locationName || body.location_name,
      address: body.address,
      lat: body.lat,
      lng: body.lng,
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
      price: body.price,
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
