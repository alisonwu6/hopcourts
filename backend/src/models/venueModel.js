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

  const placeholders = fields.map(() => '?').join(', ')
  const [result] = await db.execute(
    `INSERT INTO venues (${fields.join(', ')}) VALUES (${placeholders})`,
    values
  )
  const venueId = result.insertId

  if (sports.length) {
    const sportValues = sports.map((sport) => [venueId, sport])
    await db.query('INSERT INTO venue_sports (venue_id, sport) VALUES ?', [sportValues])
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

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ')
  const values = entries.map(([, value]) => value)
  values.push(id)

  const db = await waitForDB()
  await db.execute(`UPDATE venues SET ${setClause} WHERE id = ?`, values)
  return getVenueById(id)
}

async function replaceVenueSports(id, sports = []) {
  const db = await waitForDB()
  await db.execute('DELETE FROM venue_sports WHERE venue_id = ?', [id])
  if (!sports.length) return
  const values = sports.map((sport) => [id, sport])
  await db.query('INSERT INTO venue_sports (venue_id, sport) VALUES ?', [values])
}

async function getVenueById(id) {
  const db = await waitForDB()
  const [rows] = await db.execute('SELECT * FROM venues WHERE id = ?', [id])
  if (!rows[0]) return null
  const [sports] = await db.execute('SELECT sport FROM venue_sports WHERE venue_id = ?', [id])
  return { ...rows[0], sports: sports.map((s) => s.sport) }
}

async function listVenues() {
  const db = await waitForDB()
  const [rows] = await db.execute('SELECT * FROM venues ORDER BY created_at DESC')
  if (!rows.length) return []
  const venueIds = rows.map((venue) => venue.id)
  const [sportsRows] = await db.query(
    'SELECT venue_id, sport FROM venue_sports WHERE venue_id IN (?)',
    [venueIds]
  )
  const sportsMap = sportsRows.reduce<Record<number, string[]>>((acc, row) => {
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
