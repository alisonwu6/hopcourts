const express = require('express')
const {
  handleListCountries,
  handleListCities,
  handleListVibes,
  handleListAgeRanges,
  handleListSports,
  handleDictionaryMeta,
} = require('../../modules/dictionaries/dictionaries.controller')

const router = express.Router()

router.get('/meta/dictionaries', handleDictionaryMeta)
router.get('/countries', handleListCountries)
router.get('/cities', handleListCities)
router.get('/vibes', handleListVibes)
router.get('/age-ranges', handleListAgeRanges)
router.get('/sports', handleListSports)

module.exports = { dictionariesRouter: router }
