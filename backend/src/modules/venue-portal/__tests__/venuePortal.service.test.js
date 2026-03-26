'use strict'

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
        sportKey: 'BASKETBALL',
        title: 'Friday Basketball',
        description: 'Bring your own ball',
        startAt: new Date('2026-03-21T19:04:00.000Z'),
        endAt: new Date('2026-03-21T21:06:00.000Z'),
        capacity: 4,
        skillLevel: 'beginner',
        gender: 'mixed',
        isFree: true,
        pricePerPerson: null,
        isOfficial: true,
        status: 'published',
        visibility: 'public',
        locationName: 'ABC Sports Center',
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

  it('all sessions have is_official=true', async () => {
    await service.createRecurringEvents('venue-1', 'user-1', {
      sport_key: 'BASKETBALL',
      start_at: '19:00',
      end_at: '21:00',
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
