jest.mock('../../../../models/venues.model')
jest.mock('../../../../models/users.model')
jest.mock('../../../lib/db', () => ({ query: jest.fn() }))
jest.mock('../../../utils/geocoding', () => ({ geocodeAddress: jest.fn() }))

const venuesModel = require('../../../../models/venues.model')
const usersModel = require('../../../../models/users.model')
const venuesService = require('../venues.service')

describe('venues.service submitVenue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    usersModel.getUserById.mockResolvedValue({
      id: 'user-1',
      email: 'owner@example.com',
      display_name: 'Owner Name',
      username: 'owner',
    })
    venuesModel.submitVenue.mockResolvedValue({
      venue: {
        id: 'venue-1',
        name: 'Brodie Street Courts',
        name_display: 'Brodie Street Courts',
        venue_type: 'official',
        status: 'claimed',
        trial_ends_at: '2026-07-05T00:00:00.000Z',
      },
      claim: { id: 'claim-1' },
      sportKeys: ['BASKETBALL'],
      trialEndsAt: new Date('2026-07-05T00:00:00.000Z'),
    })
  })

  it('submits an official venue as an auto-claimable venue payload', async () => {
    const result = await venuesService.submitVenue('user-1', {
      venue_type: 'official',
      name: ' Brodie Street Courts ',
      address: ' 1 Court St ',
      lat: -27.4,
      lng: 153.0,
      sport_keys: ['basketball'],
      ownership_role: 'owner',
    })

    expect(venuesModel.submitVenue).toHaveBeenCalledWith({
      venueType: 'official',
      name: 'Brodie Street Courts',
      address: '1 Court St',
      lat: -27.4,
      lng: 153.0,
      sportKeys: ['BASKETBALL'],
      ownershipRole: 'owner',
      userId: 'user-1',
      contactName: 'Owner Name',
      contactEmail: 'owner@example.com',
      contactPhone: null,
    })
    expect(result).toEqual({
      venue_id: 'venue-1',
      name_display: 'Brodie Street Courts',
      venue_type: 'official',
      status: 'claimed',
      trial_ends_at: '2026-07-05T00:00:00.000Z',
    })
  })

  it('submits a public venue without ownership role', async () => {
    venuesModel.submitVenue.mockResolvedValueOnce({
      venue: {
        id: 'venue-2',
        name: 'QUT Courts',
        name_display: 'QUT Courts',
        venue_type: 'public',
        status: 'unclaimed',
        trial_ends_at: null,
      },
      claim: null,
      sportKeys: ['NETBALL'],
      trialEndsAt: null,
    })

    const result = await venuesService.submitVenue('user-1', {
      venue_type: 'public',
      name: 'QUT Courts',
      address: '2 Court St',
      lat: -27.4,
      lng: 153.0,
      sport_keys: ['NETBALL'],
    })

    expect(venuesModel.submitVenue).toHaveBeenCalledWith(
      expect.objectContaining({
        venueType: 'public',
        ownershipRole: null,
        sportKeys: ['NETBALL'],
      })
    )
    expect(result.venue_type).toBe('public')
    expect(result.trial_ends_at).toBeNull()
  })

  it('rejects official venues without a valid ownership role', async () => {
    await expect(
      venuesService.submitVenue('user-1', {
        venue_type: 'official',
        name: 'Brodie Street Courts',
        address: '1 Court St',
        lat: -27.4,
        lng: 153.0,
        sport_keys: ['BASKETBALL'],
      })
    ).rejects.toThrow('Invalid ownership role')
    expect(venuesModel.submitVenue).not.toHaveBeenCalled()
  })
})
