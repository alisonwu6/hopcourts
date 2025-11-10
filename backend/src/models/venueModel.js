const waitForDB = require('../utils/db')

async function createVenue({ managerId, sports = [], ...payload }) {
  const db = await waitForDB()
  const fields = [
    'manager_id',
    'name',
    'address',
    'city',
    'state',
    'postal_code',
    'description',
    'phone',
    'email',
    'website',
    'photo_url',
    'verified',
    'latitude',
    'longitude',
  ]

  const values = [
    managerId,
    payload.name,
    payload.address || null,
    payload.city || null,
    payload.state || null,
    payload.postal_code || payload.postalCode || null,
    payload.description || null,
    payload.phone || null,
    payload.email || null,
    payload.website || null,
    payload.photo_url || payload.photoUrl || null,
    payload.verified || false,
    payload.latitude || null,
    payload.longitude || null,
  ]

  const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(', ')
  const res = await db.query(
    `INSERT INTO venues (${fields.join(', ')}) VALUES (${placeholders}) RETURNING id`,
    values
  )
  const venueId = res.rows[0]?.id

  if (sports.length) {
    const rows = sports.map((sport) => [venueId, sport])
    const flatValues = rows.flat()
    const placeholdersSports = rows
      .map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`)
      .join(', ')
    await db.query(
      `INSERT INTO venue_sports (venue_id, sport) VALUES ${placeholdersSports}`,
      flatValues
    )
  }

  return venueId
}

async function updateVenue(id, updates = {}) {
  const normalized = {
    ...updates,
    postal_code: updates.postal_code ?? updates.postalCode,
    photo_url: updates.photo_url ?? updates.photoUrl,
  }
  const allowed = [
    'name',
    'address',
    'city',
    'state',
    'postal_code',
    'description',
    'phone',
    'email',
    'website',
    'photo_url',
    'verified',
    'latitude',
    'longitude',
  ]

  const entries = Object.entries(normalized).filter(
    ([key, value]) => allowed.includes(key) && value !== undefined
  )

  if (!entries.length) return null

  const assignments = entries.map(([key], idx) => `${key} = $${idx + 1}`).join(', ')
  const values = entries.map(([, value]) => value)
  values.push(id)

  const db = await waitForDB()
  await db.query(`UPDATE venues SET ${assignments} WHERE id = $${entries.length + 1}`, values)
  return getVenueById(id)
}

async function replaceVenueSports(id, sports = []) {
  const db = await waitForDB()
  await db.query('DELETE FROM venue_sports WHERE venue_id = $1', [id])
  if (!sports.length) return
  const rows = sports.map((sport) => [id, sport])
  const flatValues = rows.flat()
  const placeholders = rows.map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`).join(', ')
  await db.query(
    `INSERT INTO venue_sports (venue_id, sport) VALUES ${placeholders}`,
    flatValues
  )
}

async function getVenueById(id) {
  const db = await waitForDB()
  const venueRes = await db.query('SELECT * FROM venues WHERE id = $1', [id])
  if (!venueRes.rows[0]) return null
  const sportsRes = await db.query('SELECT sport FROM venue_sports WHERE venue_id = $1', [id])
  return { ...venueRes.rows[0], sports: sportsRes.rows.map((s) => s.sport) }
}

async function listVenues() {
  const db = await waitForDB()
  const venuesRes = await db.query('SELECT * FROM venues ORDER BY created_at DESC')
  const rows = venuesRes.rows
  if (!rows.length) return []
  const venueIds = rows.map((venue) => venue.id)
  const sportsRes = await db.query(
    'SELECT venue_id, sport FROM venue_sports WHERE venue_id = ANY($1::int[])',
    [venueIds]
  )
  const sportsMap = sportsRes.rows.reduce((acc, row) => {
    acc[row.venue_id] = acc[row.venue_id] || []
    acc[row.venue_id].push(row.sport)
    return acc
  }, {})
  return rows.map((venue) => ({
    ...venue,
    sports: sportsMap[venue.id] ?? [],
  }))
}

module.exports = {
  createVenue,
  updateVenue,
  replaceVenueSports,
  getVenueById,
  listVenues,
}
