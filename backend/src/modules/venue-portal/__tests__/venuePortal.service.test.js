'use strict'

const { fromZonedTime } = require('date-fns-tz')
const VENUE_TZ = 'Australia/Brisbane'

jest.mock('../../../../models/venues.model')
jest.mock('../../../../models/sessions.model')

const venuesModel = require('../../../../models/venues.model')
const sessionsModel = require('../../../../models/sessions.model')
const { Errors } = require('../../../lib/errors')

let service

beforeAll(() => {
  service = require('../venuePortal.service')
})

beforeEach(() => {
  jest.clearAllMocks()
})

// ── Unit 1: getMyVenue ──────────────────────────────────────────────────────

describe('getMyVenue', () => {
  it('returns venue_id, venue_name, venue_address for a venue owner', async () => {
    venuesModel.getManagedVenues.mockResolvedValue([
      {
        id: 'venue-1',
        name: 'ABC Sports Center',
        name_display: 'ABC Sports Center',
        address: '33 Brodie St, Brisbane QLD 4000',
      },
    ])

    const result = await service.getMyVenue('user-1')

    expect(result).toEqual({
      venue_id: 'venue-1',
      venue_name: 'ABC Sports Center',
      venue_address: '33 Brodie St, Brisbane QLD 4000',
    })
    expect(venuesModel.getManagedVenues).toHaveBeenCalledWith('user-1')
  })

  it('uses name when name_display is null', async () => {
    venuesModel.getManagedVenues.mockResolvedValue([
      { id: 'venue-2', name: 'Raw Name', name_display: null, address: '123 Main St' },
    ])

    const result = await service.getMyVenue('user-2')
    expect(result.venue_name).toBe('Raw Name')
  })

  it('throws notFound when user manages no venues', async () => {
    venuesModel.getManagedVenues.mockResolvedValue([])

    await expect(service.getMyVenue('user-3')).rejects.toThrow()
    await expect(service.getMyVenue('user-3')).rejects.toMatchObject({
      status: 404,
    })
  })
})

// ── Unit 2: getVenueProfile ─────────────────────────────────────────────────

describe('getVenueProfile', () => {
  it('returns profile with opening_hours and amenities groups', async () => {
    venuesModel.getVenueProfile.mockResolvedValue({
      venue_id: 'venue-1',
      logo_url: 'https://example.com/logo.png',
      opening_hours: [
        { is_open: true, open_at: '06:00', close_at: '22:00' },
        { is_open: true, open_at: '06:00', close_at: '22:00' },
        { is_open: false, open_at: null, close_at: null },
        { is_open: true, open_at: '06:00', close_at: '22:00' },
        { is_open: true, open_at: '06:00', close_at: '22:00' },
        { is_open: true, open_at: '06:00', close_at: '22:00' },
        { is_open: true, open_at: '06:00', close_at: '22:00' },
      ],
      amenities: {
        facilities: { parking: true, restroom: true },
        playing: { lighting: true },
        services: { coaching: false },
        supply: { water: true },
      },
    })

    const result = await service.getVenueProfile('venue-1')

    expect(result.logo_url).toBe('https://example.com/logo.png')
    expect(result.opening_hours).toHaveLength(7)
    expect(result.facilities).toEqual({ parking: true, restroom: true })
    expect(result.playing).toEqual({ lighting: true })
    expect(result.services).toEqual({ coaching: false })
    expect(result.supply).toEqual({ water: true })
  })

  it('returns empty defaults when profile has no amenities', async () => {
    venuesModel.getVenueProfile.mockResolvedValue({
      venue_id: 'venue-1',
      logo_url: null,
      opening_hours: null,
      amenities: null,
    })

    const result = await service.getVenueProfile('venue-1')

    expect(result.opening_hours).toEqual([])
    expect(result.facilities).toEqual({})
    expect(result.playing).toEqual({})
    expect(result.services).toEqual({})
    expect(result.supply).toEqual({})
  })

  it('returns empty defaults when no profile exists', async () => {
    venuesModel.getVenueProfile.mockResolvedValue(null)

    const result = await service.getVenueProfile('venue-1')

    expect(result.logo_url).toBeNull()
    expect(result.opening_hours).toEqual([])
    expect(result.facilities).toEqual({})
  })
})

// ── Unit 3: updateVenueProfile ──────────────────────────────────────────────

describe('updateVenueProfile', () => {
  it('packs amenities and calls upsertVenueProfile', async () => {
    venuesModel.upsertVenueProfile.mockResolvedValue({ venue_id: 'venue-1' })

    const data = {
      logo_url: 'https://example.com/logo.png',
      opening_hours: Array(7).fill({ is_open: true, open_at: '06:00', close_at: '22:00' }),
      facilities: { parking: true, restroom: true },
      playing: { lighting: true },
      services: { coaching: false },
      supply: { water: true },
    }

    await service.updateVenueProfile('venue-1', data)

    expect(venuesModel.upsertVenueProfile).toHaveBeenCalledWith('venue-1', {
      logo_url: 'https://example.com/logo.png',
      opening_hours: data.opening_hours,
      amenities: {
        facilities: { parking: true, restroom: true },
        playing: { lighting: true },
        services: { coaching: false },
        supply: { water: true },
      },
    })
  })

  it('throws validation error when opening_hours is not array of 7', async () => {
    const data = {
      opening_hours: [{ is_open: true, open_at: '06:00', close_at: '22:00' }],
    }

    await expect(service.updateVenueProfile('venue-1', data)).rejects.toMatchObject({
      status: 422,
    })
  })

  it('allows update without opening_hours', async () => {
    venuesModel.upsertVenueProfile.mockResolvedValue({ venue_id: 'venue-1' })

    const data = {
      logo_url: 'https://example.com/new-logo.png',
      facilities: { parking: true },
    }

    await service.updateVenueProfile('venue-1', data)

    expect(venuesModel.upsertVenueProfile).toHaveBeenCalledWith('venue-1', {
      logo_url: 'https://example.com/new-logo.png',
      opening_hours: undefined,
      amenities: {
        facilities: { parking: true },
        playing: undefined,
        services: undefined,
        supply: undefined,
      },
    })
  })
})

// ── Unit 4: getVenueStats ───────────────────────────────────────────────────

describe('getVenueStats', () => {
  it('returns stats from model', async () => {
    venuesModel.getVenueStats.mockResolvedValue({
      active_users: 3,
      participants_of_the_week: 42,
      total_players: 126,
    })

    const result = await service.getVenueStats('venue-1')

    expect(result).toEqual({
      active_users: 3,
      participants_of_the_week: 42,
      total_players: 126,
    })
    expect(venuesModel.getVenueStats).toHaveBeenCalledWith('venue-1')
  })
})

// ── Unit 5: createVenueEvent ────────────────────────────────────────────────

describe('createVenueEvent', () => {
  const mockVenue = {
    id: 'venue-1',
    name: 'ABC Sports Center',
    name_display: 'ABC Sports Center',
    address: '33 Brodie St, Brisbane QLD 4000',
    lat: -27.47,
    lng: 153.02,
  }

  beforeEach(() => {
    venuesModel.getVenueById.mockResolvedValue(mockVenue)
    sessionsModel.createSession.mockResolvedValue({ id: 'session-1' })
  })

  it('maps event fields to session fields correctly', async () => {
    await service.createVenueEvent('venue-1', 'user-1', {
      title: 'Friday Basketball',
      sport_key: 'BASKETBALL',
      date: '21/03/2026',
      start_at: '19:04',
      end_at: '21:06',
      court_id: 'court-earth',
      court_name: 'Earth',
      note: 'Bring your own ball',
      max_capacity: 4,
      pricing_model: 'free',
      fee: null,
      skill_level: 'beginner',
      gender_rule: 'mixed',
    })

    expect(sessionsModel.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        hostUserId: 'user-1',
        venueId: 'venue-1',
        courtId: 'court-earth',
        courtName: 'Earth',
        sportKey: 'BASKETBALL',
        title: 'Friday Basketball',
        description: 'Bring your own ball',
        startAt: fromZonedTime('2026-03-21T19:04:00', VENUE_TZ),
        endAt: fromZonedTime('2026-03-21T21:06:00', VENUE_TZ),
        capacity: 4,
        skillLevel: 'beginner',
        gender: 'mixed',
        isFree: true,
        pricePerPerson: null,
        isOfficial: true,
        status: 'published',
        visibility: 'public',
        locationName: 'ABC Sports Center - Earth',
        address: '33 Brodie St, Brisbane QLD 4000',
        lat: -27.47,
        lng: 153.02,
      })
    )
  })

  it('maps pricing_model=paid correctly', async () => {
    await service.createVenueEvent('venue-1', 'user-1', {
      sport_key: 'BASKETBALL',
      date: '21/03/2026',
      start_at: '19:00',
      end_at: '21:00',
      court_id: 'court-earth',
      court_name: 'Earth',
      max_capacity: 4,
      pricing_model: 'paid',
      fee: 15,
      skill_level: 'beginner',
      gender_rule: 'mixed',
    })

    expect(sessionsModel.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        isFree: false,
        pricePerPerson: 15,
      })
    )
  })

  it('throws validation error when sport_key is missing', async () => {
    await expect(
      service.createVenueEvent('venue-1', 'user-1', {
        date: '21/03/2026',
        start_at: '19:00',
        end_at: '21:00',
      })
    ).rejects.toMatchObject({ status: 422 })
  })

  it('throws validation error when court_id is missing', async () => {
    await expect(
      service.createVenueEvent('venue-1', 'user-1', {
        sport_key: 'BASKETBALL',
        date: '21/03/2026',
        start_at: '19:00',
      })
    ).rejects.toMatchObject({
      status: 422,
    })
  })

  it('throws validation error when date is missing', async () => {
    await expect(
      service.createVenueEvent('venue-1', 'user-1', {
        sport_key: 'BASKETBALL',
        start_at: '19:00',
        end_at: '21:00',
      })
    ).rejects.toMatchObject({ status: 422 })
  })
})

// ── Unit 6: createRecurringEvents ───────────────────────────────────────────

describe('createRecurringEvents', () => {
  const mockVenue = {
    id: 'venue-1',
    name: 'ABC Sports Center',
    name_display: 'ABC Sports Center',
    address: '33 Brodie St',
    lat: -27.47,
    lng: 153.02,
  }

  beforeEach(() => {
    venuesModel.getVenueById.mockResolvedValue(mockVenue)
    sessionsModel.createSession.mockImplementation(async (input) => ({
      id: `session-${Math.random().toString(36).slice(2, 6)}`,
      starts_at: input.startAt,
    }))
  })

  it('creates 4 sessions spaced 7 days apart', async () => {
    const result = await service.createRecurringEvents('venue-1', 'user-1', {
      sport_key: 'BASKETBALL',
      start_at: '19:04',
      end_at: '21:06',
      court_id: 'court-earth',
      court_name: 'Earth',
      skill_level: 'beginner',
      gender_rule: 'mixed',
      max_capacity: 4,
      pricing_model: 'free',
      fee: null,
    })

    expect(sessionsModel.createSession).toHaveBeenCalledTimes(4)
    expect(result.created).toHaveLength(4)

    // Verify dates are 7 days apart
    const calls = sessionsModel.createSession.mock.calls
    const firstDate = calls[0][0].startAt
    for (let i = 1; i < 4; i++) {
      const expectedDate = new Date(firstDate)
      expectedDate.setDate(expectedDate.getDate() + 7 * i)
      expect(calls[i][0].startAt).toEqual(expectedDate)
    }
  })

  it('throws validation error when court_id is missing', async () => {
    await expect(
      service.createRecurringEvents('venue-1', 'user-1', {
        sport_key: 'BASKETBALL',
        start_at: '19:00',
        end_at: '21:00',
      })
    ).rejects.toMatchObject({ status: 422 })
  })

  it('all sessions have is_official=true', async () => {
    await service.createRecurringEvents('venue-1', 'user-1', {
      sport_key: 'BASKETBALL',
      start_at: '19:00',
      end_at: '21:00',
      court_id: 'court-earth',
      court_name: 'Earth',
      skill_level: 'beginner',
      gender_rule: 'mixed',
      max_capacity: 4,
      pricing_model: 'free',
    })

    const calls = sessionsModel.createSession.mock.calls
    for (const [payload] of calls) {
      expect(payload.isOfficial).toBe(true)
      expect(payload.status).toBe('published')
    }
  })
})

// ── Unit 7: listVenueEvents ─────────────────────────────────────────────────

describe('listVenueEvents', () => {
  it('groups sessions by date key (DD/MM/YYYY)', async () => {
    sessionsModel.listVenueSessions.mockResolvedValue([
      {
        id: 'session-1',
        sport_key: 'BASKETBALL',
        starts_at: '2026-04-06T08:12:00.000Z',
        court_id: 'court-earth',
        court_name: 'Earth',
        max_people: 4,
        participant_count: 3,
      },
      {
        id: 'session-2',
        sport_key: 'BADMINTON',
        starts_at: '2026-04-06T10:00:00.000Z',
        court_id: 'court-venus',
        court_name: 'Venus',
        max_people: 4,
        participant_count: 1,
      },
      {
        id: 'session-3',
        sport_key: 'BASKETBALL',
        starts_at: '2026-04-13T08:12:00.000Z',
        court_id: 'court-mercury',
        court_name: 'Mercury',
        max_people: 4,
        participant_count: 0,
      },
    ])

    const result = await service.listVenueEvents('venue-1', {
      from: '2026-04-01',
      to: '2026-04-30',
    })

    expect(result['06/04/2026']).toHaveLength(2)
    expect(result['13/04/2026']).toHaveLength(1)
    expect(result['06/04/2026'][0]).toEqual({
      event_id: 'session-1',
      sport: 'BASKETBALL',
      start_at: '18:12',
      court_id: 'court-earth',
      court_name: 'Earth',
      max_capacity: 4,
      participant_count: 3,
    })
  })

  it('returns empty object when no events in range', async () => {
    sessionsModel.listVenueSessions.mockResolvedValue([])

    const result = await service.listVenueEvents('venue-1', { from: '2026-04-01', to: '2026-04-30' })

    expect(result).toEqual({})
  })
})

// ── Unit 8: getEventDetail ──────────────────────────────────────────────────

describe('getEventDetail', () => {
  it('returns event with participant_count', async () => {
    sessionsModel.getSessionById.mockResolvedValue({
      id: 'session-1',
      venue_id: 'venue-1',
      sport_key: 'BASKETBALL',
      starts_at: '2026-04-06T19:04:00.000Z',
      ends_at: '2026-04-06T21:06:00.000Z',
      max_people: 4,
      skill_level: 'beginner',
      gender: 'mixed',
      is_free: true,
      price_per_person: null,
      status: 'published',
      description: 'test',
    })
    sessionsModel.getParticipantCount.mockResolvedValue(3)
    venuesModel.getApprovedClaimByUser.mockResolvedValue({ id: 'claim-1' })

    const result = await service.getEventDetail('session-1', 'user-1')

    expect(result.id).toBe('session-1')
    expect(result.participant_count).toBe(3)
    expect(sessionsModel.getSessionById).toHaveBeenCalledWith('session-1')
    expect(venuesModel.getApprovedClaimByUser).toHaveBeenCalledWith('venue-1', 'user-1')
  })

  it('throws notFound when session does not exist', async () => {
    sessionsModel.getSessionById.mockResolvedValue(null)

    await expect(service.getEventDetail('bad-id', 'user-1')).rejects.toMatchObject({
      status: 404,
    })
  })

  it('throws forbidden when user does not own the venue', async () => {
    sessionsModel.getSessionById.mockResolvedValue({
      id: 'session-1',
      venue_id: 'venue-1',
    })
    venuesModel.getApprovedClaimByUser.mockResolvedValue(null)

    await expect(service.getEventDetail('session-1', 'user-2')).rejects.toMatchObject({
      status: 403,
    })
  })
})

// ── Unit 9: updateVenueEvent ────────────────────────────────────────────────

describe('updateVenueEvent', () => {
  beforeEach(() => {
    sessionsModel.getSessionById.mockResolvedValue({
      id: 'session-1',
      venue_id: 'venue-1',
    })
    venuesModel.getApprovedClaimByUser.mockResolvedValue({ id: 'claim-1' })
    sessionsModel.updateSession.mockResolvedValue({ id: 'session-1', sport_key: 'BASKETBALL' })
  })

  it('maps event fields and calls updateSession', async () => {
    await service.updateVenueEvent('session-1', 'user-1', {
      sport_key: 'BASKETBALL',
      start_at: '19:04',
      end_at: '21:06',
      skill_level: 'beginner',
      gender_rule: 'mixed',
      max_capacity: 4,
      pricing_model: 'free',
      fee: null,
    })

    expect(sessionsModel.updateSession).toHaveBeenCalledWith(
      'session-1',
      expect.objectContaining({
        sportKey: 'BASKETBALL',
        skillLevel: 'beginner',
        gender: 'mixed',
        maxPeople: 4,
        isFree: true,
        pricePerPerson: null,
      })
    )
  })

  it('throws notFound when session does not exist', async () => {
    sessionsModel.getSessionById.mockResolvedValue(null)

    await expect(
      service.updateVenueEvent('bad-id', 'user-1', { sport_key: 'BASKETBALL' })
    ).rejects.toMatchObject({ status: 404 })
  })

  it('throws forbidden when user does not own the venue', async () => {
    venuesModel.getApprovedClaimByUser.mockResolvedValue(null)

    await expect(
      service.updateVenueEvent('session-1', 'user-2', { sport_key: 'BASKETBALL' })
    ).rejects.toMatchObject({ status: 403 })
  })

  it('maps pricing_model=paid correctly', async () => {
    await service.updateVenueEvent('session-1', 'user-1', {
      pricing_model: 'paid',
      fee: 20,
    })

    expect(sessionsModel.updateSession).toHaveBeenCalledWith(
      'session-1',
      expect.objectContaining({
        isFree: false,
        pricePerPerson: 20,
      })
    )
  })
})
