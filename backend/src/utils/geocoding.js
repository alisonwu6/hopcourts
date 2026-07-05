'use strict'

const { query } = require('../lib/db')
const geocodeCache = new Map()

async function geocodeAddress(address) {
  const input = String(address || '').trim()
  if (!input) return null

  if (geocodeCache.has(input)) {
    return geocodeCache.get(input)
  }

  const token = process.env.MAPBOX_TOKEN
  if (!token) return null

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?limit=1&language=en&access_token=${token}`

  try {
    const response = await fetch(endpoint)
    if (!response.ok) return null

    const body = await response.json()
    const center = body?.features?.[0]?.center
    if (!Array.isArray(center) || center.length < 2) return null

    const lng = Number(center[0])
    const lat = Number(center[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    const result = { lat, lng }
    geocodeCache.set(input, result)
    return result
  } catch {
    return null
  }
}

async function resolveCityKeyByCoords(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  try {
    const { rows } = await query(
      `SELECT key FROM public.cities
       WHERE is_active = true
         AND $1 BETWEEN lat_min AND lat_max
         AND $2 BETWEEN lng_min AND lng_max
       LIMIT 1`,
      [lat, lng]
    )
    return rows[0]?.key ?? null
  } catch {
    return null
  }
}

module.exports = { geocodeAddress, resolveCityKeyByCoords }
