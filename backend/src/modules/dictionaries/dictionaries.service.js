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

const VERSION_SQL = (table) =>
  `select coalesce(to_char(max(updated_at), 'YYYY-MM-DD"T"HH24:MI:SSZ'), '1970-01-01T00:00:00Z') as version from public.${table}`

async function dictionaryMeta() {
  const meta = {}

  const tables = {
    sports:     'sports',
    vibes:      'vibes',
    countries:  'countries',
    age_ranges: 'age_ranges',
    cities:     'cities',
  }

  await Promise.all(
    Object.entries(tables).map(async ([key, table]) => {
      try {
        const res = await query(VERSION_SQL(table))
        meta[key] = { version: res.rows[0]?.version ?? '1970-01-01T00:00:00Z' }
      } catch {
        meta[key] = { version: '1970-01-01T00:00:00Z' }
      }
    })
  )

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
