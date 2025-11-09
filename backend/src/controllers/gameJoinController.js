const { joinGame, leaveGame, listGamePlayers } = require('../models/gameJoinModel')
const { getGameById } = require('../models/gameModel')

async function handleJoinGame(req, res) {
  try {
    const game = await getGameById(req.params.id)
    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }
    if (game.attendees?.length >= game.max_players) {
      return res.status(400).json({ message: 'Game is full' })
    }
    await joinGame(req.params.id, req.userId)
    const players = await listGamePlayers(req.params.id)
    res.json({ players })
  } catch (error) {
    console.error('Failed to join game', error)
    res.status(500).json({ message: 'Unable to join game' })
  }
}

async function handleLeaveGame(req, res) {
  try {
    await leaveGame(req.params.id, req.userId)
    res.json({ success: true })
  } catch (error) {
    console.error('Failed to leave game', error)
    res.status(500).json({ message: 'Unable to leave game' })
  }
}

async function handleListPlayers(req, res) {
  try {
    const players = await listGamePlayers(req.params.id)
    res.json({ players })
  } catch (error) {
    console.error('Failed to list players', error)
    res.status(500).json({ message: 'Unable to load game players' })
  }
}

module.exports = {
  handleJoinGame,
  handleLeaveGame,
  handleListPlayers,
}
