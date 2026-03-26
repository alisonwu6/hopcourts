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
