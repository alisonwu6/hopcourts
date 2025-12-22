const countriesModel = require('../../../models/countries.model')
const citiesModel = require('../../../models/cities.model')
const vibesModel = require('../../../models/vibes.model')
const ageRangesModel = require('../../../models/ageRanges.model')

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

module.exports = {
  listCountries,
  listCities,
  listVibes,
  listAgeRanges,
}
