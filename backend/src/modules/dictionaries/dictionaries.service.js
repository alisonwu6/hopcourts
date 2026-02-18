const countriesModel = require('../../../models/countries.model')
const citiesModel = require('../../../models/cities.model')
const vibesModel = require('../../../models/vibes.model')
const ageRangesModel = require('../../../models/ageRanges.model')
const sportsModel = require('../../../models/sports.model')
const { query } = require('../../lib/db')

function parseLang(query) {
  const lang = (query.lang || 'zh').toString()
  return lang === 'en' ? 'en' : 'zh'
}

async function listCountries(query = {}) {
  const lang = parseLang(query)
  const items = await countriesModel.listCountries({ lang })
  return { items }
}

async function listCities(query = {}) {
  const lang = parseLang(query)
  const country = query.country
  const items = await citiesModel.listCities({ country, lang })
  return { items }
}

async function listVibes(query = {}) {
  const lang = parseLang(query)
  const items = await vibesModel.listVibes({ lang })
  return { items }
}

async function listAgeRanges(query = {}) {
  const lang = parseLang(query)
  const items = await ageRangesModel.listAgeRanges({ lang })
  return { items }
}

async function listSports(query = {}) {
  const lang = parseLang(query)
  const items = await sportsModel.listSports({ locale: lang })
  return { items }
}

async function dictionaryMeta() {
  const meta = {}
  const now = new Date().toISOString()

  /*
  try {
    const configRes = await query(
      `select value from public.system_config where key = 'sm.dict.meta'`
    )
    if (configRes.rows.length > 0) {
      // ...
    }
  } catch (err) {
    console.error('Failed to read system_config for dict meta', err)
  }
  */

  // Fallback
  try {
    const sportsRes = await query(
      `select coalesce(to_char(max(updated_at), 'YYYY-MM-DD"T"HH24:MI:SSZ'), to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SSZ')) as version from public.sports`
    )
    meta.sports = { version: sportsRes.rows[0]?.version || now }
  } catch {
    meta.sports = { version: now }
  }

  meta.vibes = { version: now }
  meta.countries = { version: now }
  meta.age_ranges = { version: now }
  meta.cities = { version: now }

  return meta
}

module.exports = {
  listCountries,
  listCities,
  listVibes,
  listAgeRanges,
  listSports,
  dictionaryMeta,
}
