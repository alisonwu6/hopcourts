const express = require('express')
const router = express.Router()
const { handleGetVenue, handleListVenues } = require('../controllers/venueController')

router.get('/', handleListVenues)
router.get('/:id', handleGetVenue)

module.exports = router
