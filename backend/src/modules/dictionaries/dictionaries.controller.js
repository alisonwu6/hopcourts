const { ok } = require('../../lib/respond')
const {
  listCountries,
  listCities,
  listVibes,
  listAgeRanges,
  dictionaryMeta,
} = require('./dictionaries.service')

async function handleListCountries(req, res, next) {
  try {
    const data = await listCountries(req.query || {})
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleListCities(req, res, next) {
  try {
    const data = await listCities(req.query || {})
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleListVibes(req, res, next) {
  try {
    const data = await listVibes(req.query || {})
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleListAgeRanges(req, res, next) {
  try {
    const data = await listAgeRanges(req.query || {})
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleDictionaryMeta(_req, res, next) {
  try {
    const data = await dictionaryMeta()
    return ok(res, { data })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  handleListCountries,
  handleListCities,
  handleListVibes,
  handleListAgeRanges,
  handleDictionaryMeta,
}
