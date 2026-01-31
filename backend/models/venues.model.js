const { query } = require('../db/client')

async function createVenue(input) {
  const sql = `
    INSERT INTO public.venues (
      name_display,
      address_display,
      lat,
      lng,
      status
    ) VALUES (
      $1, $2, $3, $4, $5
    )
    RETURNING *
  `
  const params = [
    input.name,
    input.address,
    input.lat,
    input.lng,
    input.status ?? 'unclaimed' // 'unclaimed' | 'claimed'
  ]
  const { rows } = await query(sql, params)
  return rows[0]
}

async function findNearbyVenues({ lat, lng, radiusMeters = 100 }) {
  // Simple bounding box for MVP
  // 1 deg lat ~= 111km -> 1m ~= 1/111000 deg
  const latDelta = radiusMeters / 111320
  // Adjust lng delta based on latitude
  const lngDelta = radiusMeters / (40008000 / 360 * Math.cos(lat * Math.PI / 180))

  const sql = `
    SELECT * FROM public.venues
    WHERE lat BETWEEN $1 AND $2
      AND lng BETWEEN $3 AND $4
  `
  const params = [
    lat - latDelta, lat + latDelta,
    lng - Math.abs(lngDelta), lng + Math.abs(lngDelta)
  ]
  
  const { rows } = await query(sql, params)
  return rows
}

async function getVenueById(id) {
  const sql = `SELECT * FROM public.venues WHERE id = $1`
  const { rows } = await query(sql, [id])
  return rows[0]
}

module.exports = {
  createVenue,
  findNearbyVenues,
  getVenueById
}
