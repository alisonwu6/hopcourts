const countriesModel = require('../../../models/countries.model')
const citiesModel = require('../../../models/cities.model')
const vibesModel = require('../../../models/vibes.model')
const ageRangesModel = require('../../../models/ageRanges.model')
const { query } = require('../../../db/client')

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
  const country = query.country || query.country_key
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

async function dictionaryMeta() {
  const meta = {}
  // sports: use updated_at ；其他暫用 now()
  const sportsRes = await query(
    `select coalesce(to_char(max(updated_at), 'YYYY-MM-DD\"T\"HH24:MI:SSZ'), to_char(now(), 'YYYY-MM-DD\"T\"HH24:MI:SSZ')) as version from public.sports`
  )
  meta.sports = { version: sportsRes.rows[0]?.version || new Date().toISOString() }
  const now = new Date().toISOString()
  meta.vibes = { version: now }
  meta.countries = { version: now }
  meta.age_ranges = { version: now }
  return meta
}

module.exports = {
  listCountries,
  listCities,
  listVibes,
  listAgeRanges,
  dictionaryMeta,
}
