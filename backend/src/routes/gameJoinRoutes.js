const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const {
  handleJoinGame,
  handleLeaveGame,
  handleListPlayers,
} = require('../controllers/gameJoinController')

router.post('/games/:id/join', verifyToken, handleJoinGame)
router.delete('/games/:id/leave', verifyToken, handleLeaveGame)
router.get('/games/:id/players', verifyToken, handleListPlayers)

module.exports = router
