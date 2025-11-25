const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const gameController = require('../controllers/gameController')

router.get('/games', gameController.discoverGames)
router.get('/games/mine', verifyToken, gameController.getMyGames)
router.get('/games/:id', gameController.getGame)
router.post('/games', verifyToken, gameController.createGame)
router.put('/games/:id', verifyToken, gameController.updateGame)
router.post('/games/:id/cancel', verifyToken, gameController.cancelGame)
router.delete('/games/:id', verifyToken, gameController.deleteGame)

module.exports = router
