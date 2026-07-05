'use strict'

const { fromZonedTime, toZonedTime } = require('date-fns-tz')
const venuesModel = require('../../../models/venues.model')
const sessionsModel = require('../../../models/sessions.model')
const { resolveCityKeyByCoords } = require('../../utils/geocoding')
const { Errors } = require('../../lib/errors')

const VENUE_TZ = 'Australia/Brisbane'

async function getMyVenue(userId) {
  const venues = await venuesModel.getManagedVenues(userId)
  if (!venues || venues.length === 0) {
    throw Errors.notFound('No managed venues found')
  }
  const venue = venues[0]
  return {
    venue_id: venue.id,
    venue_name: venue.name_display || venue.name,
    venue_address: venue.address,
  }
}

async function getVenueProfile(venueId) {
  const profile = await venuesModel.getVenueProfile(venueId)
  const amenities = (profile && profile.amenities) || {}
  return {
    logo_url: (profile && profile.logo_url) || null,
    description: (profile && profile.description) || '',
    social_links: (profile && profile.social_links) || {},
    opening_hours: (profile && profile.opening_hours) || [],
    facilities: amenities.facilities || {},
    playing: amenities.playing || {},
    services: amenities.services || {},
    supply: amenities.supply || {},
    spaces: Array.isArray(profile?.spaces) ? profile.spaces : [],
  }
}

async function getVenueCourts(venueId) {
  const profile = await venuesModel.getVenueProfile(venueId)
  const spaces = Array.isArray(profile?.spaces) ? profile.spaces : []

  return spaces
    .map((space, index) => ({
      id: String(space?.id || `court-${index + 1}`),
      name: String(space?.name || '').trim(),
      supported_sports: Array.isArray(space?.supported_sports) ? space.supported_sports.filter(Boolean) : [],
    }))
    .filter((court) => court.name)
}

async function updateVenueProfile(venueId, data) {
  if (data.opening_hours && (!Array.isArray(data.opening_hours) || data.opening_hours.length !== 7)) {
    throw Errors.validation('opening_hours must be an array of exactly 7 entries (Monday–Sunday)')
  }

  if (data.spaces && !Array.isArray(data.spaces)) {
    throw Errors.validation('spaces must be an array')
  }

  const payload = {
    logo_url: data.logo_url,
    description: data.description,
    social_links: data.social_links,
    opening_hours: data.opening_hours,
    spaces: data.spaces,
    amenities: {
      facilities: data.facilities,
      playing: data.playing,
      services: data.services,
      supply: data.supply,
    },
  }

  return venuesModel.upsertVenueProfile(venueId, payload)
}

async function getVenueStats(venueId) {
  return venuesModel.getVenueStats(venueId)
}

function parseDateAndTime(dateStr, timeStr) {
  // dateStr: "DD/MM/YYYY", timeStr: "HH:mm"
  // Interpret the operator's input as Brisbane local time and convert to UTC
  // so the stored timestamp is correct regardless of server timezone.
  const [day, month, year] = dateStr.split('/')
  return fromZonedTime(`${year}-${month}-${day}T${timeStr}:00`, VENUE_TZ)
}

function buildVenuePlaceName(venue, eventData) {
  const venueDisplayName = venue.name_display || venue.name
  const courtName = String(eventData?.court_name || '').trim()
  if (!courtName) return venueDisplayName
  return `${venueDisplayName} - ${courtName}`
}

function normalizeGenderRule(genderRule) {
  const value = String(genderRule || 'mixed').toLowerCase()
  if (value === 'men' || value === 'male') return 'male'
  if (value === 'women' || value === 'female') return 'female'
  return 'mixed'
}

function normalizeSportKey(value) {
  return String(value || '').trim().replace(/[\s-]+/g, '_').toUpperCase()
}

async function validateCourtSupportsSport(venueId, courtId, sportKey) {
  if (!courtId) return
  if (!sportKey) return

  const profile = await venuesModel.getVenueProfile(venueId)
  const spaces = Array.isArray(profile?.spaces) ? profile.spaces : []

  const court = spaces.find((s) => String(s.id || s.name) === String(courtId))
  if (!court) {
    // If it's a legacy court name without ID, we can skip or find by name.
    // The courts API uses name as ID if ID is missing.
    return
  }

  const supportedSports = Array.isArray(court.supported_sports)
    ? court.supported_sports.filter(Boolean)
    : []

  // If the court has a non-empty supported_sports list, we MUST check it.
  if (supportedSports.length > 0) {
    const isSupported = supportedSports.some(
      (s) => normalizeSportKey(s) === normalizeSportKey(sportKey)
    )
    if (!isSupported) {
      throw Errors.validation(`Court "${court.name}" does not support ${sportKey}.`)
    }
  }
}

async function createVenueEvent(venueId, userId, eventData) {
  if (!eventData.sport_key) {
    throw Errors.validation('sport_key is required')
  }
  if (!eventData.date) {
    throw Errors.validation('date is required')
  }
  if (!eventData.start_at) {
    throw Errors.validation('start_at is required')
  }
  if (!eventData.court_id) {
    throw Errors.validation('court_id is required')
  }

  // Guard: Court must support the sport
  await validateCourtSupportsSport(venueId, eventData.court_id, eventData.sport_key)

  const venue = await venuesModel.getVenueById(venueId)
  const isFree = eventData.pricing_model !== 'paid'

  const payload = {
    hostUserId: userId,
    venueId,
    courtId: eventData.court_id,
    courtName: eventData.court_name || null,
    sportKey: eventData.sport_key,
    title: eventData.title || null,
    description: eventData.note || null,
    startAt: parseDateAndTime(eventData.date, eventData.start_at),
    endAt: eventData.end_at ? parseDateAndTime(eventData.date, eventData.end_at) : null,
    minPeople: eventData.min_people || null,
    capacity: eventData.max_capacity || null,
    skillLevel: eventData.skill_level || 'any',
    gender: normalizeGenderRule(eventData.gender_rule),
    isFree,
    pricePerPerson: isFree ? null : (eventData.fee || null),
    priceMode: isFree ? 'total' : (eventData.price_mode || 'person'),
    priceNote: eventData.price_note || null,
    isOfficial: true,
    status: 'published',
    visibility: 'public',
    locationName: buildVenuePlaceName(venue, eventData),
    address: venue.address,
    lat: venue.lat,
    lng: venue.lng,
    cityKey: await resolveCityKeyByCoords(venue.lat, venue.lng),
  }

  return sessionsModel.createSession(payload)
}

function getNextDayOfWeek(dayOfWeek) {
  const now = toZonedTime(new Date(), VENUE_TZ)
  const currentDay = now.getDay()
  let daysUntil = dayOfWeek - currentDay
  if (daysUntil <= 0) daysUntil += 7
  const next = new Date(now)
  next.setDate(now.getDate() + daysUntil)
  return next
}

async function createRecurringEvents(venueId, userId, eventData) {
  if (!eventData.sport_key) {
    throw Errors.validation('sport_key is required')
  }
  if (!eventData.start_at) {
    throw Errors.validation('start_at is required')
  }
  if (!eventData.court_id) {
    throw Errors.validation('court_id is required')
  }

  // Guard: Court must support the sport
  await validateCourtSupportsSport(venueId, eventData.court_id, eventData.sport_key)

  const venue = await venuesModel.getVenueById(venueId)
  const isFree = eventData.pricing_model !== 'paid'

  // Determine base day — use current weekday, generate next 4 occurrences
  const now = new Date()
  const nowZoned = toZonedTime(now, VENUE_TZ)
  const baseDay = nowZoned.getDay()
  const nextOccurrence = getNextDayOfWeek(baseDay)

  const created = []
  const errors = []

  for (let i = 0; i < 4; i++) {
    const eventDate = new Date(nextOccurrence)
    eventDate.setDate(nextOccurrence.getDate() + 7 * i)

    const dateStr = `${String(eventDate.getDate()).padStart(2, '0')}/${String(eventDate.getMonth() + 1).padStart(2, '0')}/${eventDate.getFullYear()}`

    const payload = {
      hostUserId: userId,
      venueId,
      courtId: eventData.court_id || null,
      courtName: eventData.court_name || null,
      sportKey: eventData.sport_key,
      title: eventData.title || null,
      description: eventData.note || null,
      startAt: parseDateAndTime(dateStr, eventData.start_at),
      endAt: eventData.end_at ? parseDateAndTime(dateStr, eventData.end_at) : null,
      minPeople: eventData.min_people || null,
      capacity: eventData.max_capacity || null,
      skillLevel: eventData.skill_level || 'any',
      gender: normalizeGenderRule(eventData.gender_rule),
      isFree,
      pricePerPerson: isFree ? null : (eventData.fee || null),
      priceMode: isFree ? 'total' : (eventData.price_mode || 'person'),
      priceNote: eventData.price_note || null,
      isOfficial: true,
      status: 'published',
      visibility: 'public',
      locationName: buildVenuePlaceName(venue, eventData),
      address: venue.address,
      lat: venue.lat,
      lng: venue.lng,
      cityKey: await resolveCityKeyByCoords(venue.lat, venue.lng),
    }

    try {
      const session = await sessionsModel.createSession(payload)
      created.push(session)
    } catch (err) {
      errors.push({ week: i + 1, error: err.message })
    }
  }

  return { created, errors }
}

async function listVenueEvents(venueId, { from, to } = {}) {
  const sessions = await sessionsModel.listVenueSessions(venueId, { from, to })

  const grouped = {}
  for (const session of sessions) {
    const zoned = toZonedTime(new Date(session.starts_at), VENUE_TZ)
    const dateKey = `${String(zoned.getDate()).padStart(2, '0')}/${String(zoned.getMonth() + 1).padStart(2, '0')}/${zoned.getFullYear()}`
    const timeStr = `${String(zoned.getHours()).padStart(2, '0')}:${String(zoned.getMinutes()).padStart(2, '0')}`

    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push({
      event_id: session.id,
      sport: session.sport_key,
      start_at: timeStr,
      court_id: session.court_id || null,
      court_name: session.court_name || null,
      max_capacity: session.max_people,
      participant_count: session.participant_count,
    })
  }

  return grouped
}

async function getEventDetail(eventId, userId) {
  const session = await sessionsModel.getSessionById(eventId)
  if (!session) {
    throw Errors.notFound('Event not found')
  }

  const claim = await venuesModel.getApprovedClaimByUser(session.venue_id, userId)
  if (!claim) {
    throw Errors.forbidden('You do not manage this venue')
  }

  const participantCount = await sessionsModel.getParticipantCount(eventId)

  return {
    ...session,
    participant_count: participantCount,
  }
}

async function updateVenueEvent(eventId, userId, eventData) {
  const session = await sessionsModel.getSessionById(eventId)
  if (!session) {
    throw Errors.notFound('Event not found')
  }

  const claim = await venuesModel.getApprovedClaimByUser(session.venue_id, userId)
  if (!claim) {
    throw Errors.forbidden('You do not manage this venue')
  }

  // Guard: Court must support the sport
  await validateCourtSupportsSport(
    session.venue_id,
    eventData.court_id,
    eventData.sport_key || session.sport_key
  )

  const hasCourtNameField = Object.prototype.hasOwnProperty.call(eventData, 'court_name')
  const venue = hasCourtNameField ? await venuesModel.getVenueById(session.venue_id) : null

  const isFree = eventData.pricing_model !== undefined
    ? eventData.pricing_model !== 'paid'
    : undefined

  const patch = {
    sportKey: eventData.sport_key,
    startAt: eventData.start_at !== undefined && eventData.date
      ? parseDateAndTime(eventData.date, eventData.start_at)
      : undefined,
    endAt: eventData.end_at !== undefined && eventData.date
      ? parseDateAndTime(eventData.date, eventData.end_at)
      : undefined,
    skillLevel: eventData.skill_level,
    gender: eventData.gender_rule !== undefined ? normalizeGenderRule(eventData.gender_rule) : undefined,
    minPeople: eventData.min_people,
    maxPeople: eventData.max_capacity,
    title: eventData.title,
    description: eventData.note,
    courtId: eventData.court_id,
    courtName: eventData.court_name,
    locationName: hasCourtNameField ? buildVenuePlaceName(venue, eventData) : undefined,
    isFree,
    pricePerPerson: isFree === undefined
      ? undefined
      : isFree ? null : (eventData.fee || null),
    priceMode: eventData.price_mode,
    priceNote: eventData.price_note,
  }

  return sessionsModel.updateSession(eventId, patch)
}

async function getEventParticipants(eventId, userId) {
  const session = await sessionsModel.getSessionById(eventId)
  if (!session) throw Errors.notFound('Event not found')

  const claim = await venuesModel.getApprovedClaimByUser(session.venue_id, userId)
  if (!claim) throw Errors.forbidden('You do not manage this venue')

  const rows = await sessionsModel.listSessionParticipants(eventId)
  return rows.map((r) => ({
    user_id: r.user_id,
    display_name: r.display_name || r.username || 'Player',
    avatar_url: r.avatar_url || null,
    role: r.role,
    joined_at: r.joined_at,
  }))
}

module.exports = {
  getMyVenue,
  getVenueProfile,
  getVenueCourts,
  updateVenueProfile,
  getVenueStats,
  createVenueEvent,
  createRecurringEvents,
  listVenueEvents,
  getEventDetail,
  updateVenueEvent,
  getEventParticipants,
}
