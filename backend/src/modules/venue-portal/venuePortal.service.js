'use strict'

const venuesModel = require('../../../models/venues.model')
const sessionsModel = require('../../../models/sessions.model')
const { Errors } = require('../../lib/errors')

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
    opening_hours: (profile && profile.opening_hours) || [],
    facilities: amenities.facilities || {},
    playing: amenities.playing || {},
    services: amenities.services || {},
    supply: amenities.supply || {},
  }
}

async function updateVenueProfile(venueId, data) {
  if (data.opening_hours && (!Array.isArray(data.opening_hours) || data.opening_hours.length !== 7)) {
    throw Errors.validation('opening_hours must be an array of exactly 7 entries (Monday–Sunday)')
  }

  const payload = {
    logo_url: data.logo_url,
    opening_hours: data.opening_hours,
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
  const [day, month, year] = dateStr.split('/')
  return new Date(`${year}-${month}-${day}T${timeStr}:00.000Z`)
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

  const venue = await venuesModel.getVenueById(venueId)
  const isFree = eventData.pricing_model !== 'paid'

  const payload = {
    hostUserId: userId,
    venueId,
    sportKey: eventData.sport_key,
    title: eventData.title || null,
    description: eventData.note || null,
    startAt: parseDateAndTime(eventData.date, eventData.start_at),
    endAt: eventData.end_at ? parseDateAndTime(eventData.date, eventData.end_at) : null,
    capacity: eventData.max_capacity || null,
    skillLevel: eventData.skill_level || 'any',
    gender: eventData.gender_rule || 'mixed',
    isFree,
    pricePerPerson: isFree ? null : (eventData.fee || null),
    priceMode: isFree ? 'total' : 'person',
    isOfficial: true,
    status: 'published',
    visibility: 'public',
    locationName: venue.name_display || venue.name,
    address: venue.address,
    lat: venue.lat,
    lng: venue.lng,
  }

  return sessionsModel.createSession(payload)
}

function getNextDayOfWeek(dayOfWeek) {
  const now = new Date()
  const currentDay = now.getUTCDay()
  let daysUntil = dayOfWeek - currentDay
  if (daysUntil <= 0) daysUntil += 7
  const next = new Date(now)
  next.setUTCDate(now.getUTCDate() + daysUntil)
  return next
}

async function createRecurringEvents(venueId, userId, eventData) {
  if (!eventData.sport_key) {
    throw Errors.validation('sport_key is required')
  }
  if (!eventData.start_at) {
    throw Errors.validation('start_at is required')
  }

  const venue = await venuesModel.getVenueById(venueId)
  const isFree = eventData.pricing_model !== 'paid'

  // Determine base day — use current weekday, generate next 4 occurrences
  const now = new Date()
  const baseDay = now.getUTCDay()
  const nextOccurrence = getNextDayOfWeek(baseDay)

  const created = []
  const errors = []

  for (let i = 0; i < 4; i++) {
    const eventDate = new Date(nextOccurrence)
    eventDate.setUTCDate(nextOccurrence.getUTCDate() + 7 * i)

    const dateStr = `${String(eventDate.getUTCDate()).padStart(2, '0')}/${String(eventDate.getUTCMonth() + 1).padStart(2, '0')}/${eventDate.getUTCFullYear()}`

    const payload = {
      hostUserId: userId,
      venueId,
      sportKey: eventData.sport_key,
      title: eventData.title || null,
      description: eventData.note || null,
      startAt: parseDateAndTime(dateStr, eventData.start_at),
      endAt: eventData.end_at ? parseDateAndTime(dateStr, eventData.end_at) : null,
      capacity: eventData.max_capacity || null,
      skillLevel: eventData.skill_level || 'any',
      gender: eventData.gender_rule || 'mixed',
      isFree,
      pricePerPerson: isFree ? null : (eventData.fee || null),
      priceMode: isFree ? 'total' : 'person',
      isOfficial: true,
      status: 'published',
      visibility: 'public',
      locationName: venue.name_display || venue.name,
      address: venue.address,
      lat: venue.lat,
      lng: venue.lng,
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

module.exports = {
  getMyVenue,
  getVenueProfile,
  updateVenueProfile,
  getVenueStats,
  createVenueEvent,
  createRecurringEvents,
}
