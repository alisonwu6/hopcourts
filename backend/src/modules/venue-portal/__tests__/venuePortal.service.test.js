'use strict'

jest.mock('../../../../models/venues.model')
jest.mock('../../../../models/sessions.model')

const venuesModel = require('../../../../models/venues.model')
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
