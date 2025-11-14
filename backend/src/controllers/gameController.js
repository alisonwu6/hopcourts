const gameModel = require('../models/gameModel')
const { listGamePlayers } = require('../models/gameJoinModel')
const { createMessage } = require('../models/messageModel')

async function notifyParticipants(gameId, senderId, body) {
  try {
    const participants = await listGamePlayers(gameId)
    const hasActive = participants.some((player) => player.status === 'joined')
    if (!hasActive) return
    await createMessage({ gameId, senderId, body })
  } catch (err) {
    console.warn('Failed to notify game participants:', err.message)
  }
}

async function discoverGames(req, res) {
  try {
    const filters = {
      sport: req.query.sport,
      area: req.query.area,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    }
    const games = await gameModel.listGames(filters)
    res.json({ data: games })
  } catch (error) {
    console.error('Failed to fetch games', error)
    res.status(500).json({ message: 'Failed to load games' })
  }
}

async function getGame(req, res) {
  try {
    const game = await gameModel.getGameById(req.params.id)
    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }
    res.json(game)
  } catch (error) {
    console.error('Failed to fetch game', error)
    res.status(500).json({ message: 'Failed to load game' })
  }
}

async function createGame(req, res) {
  try {
    const required = ['title', 'sport', 'startTime', 'endTime', 'maxPlayers']
    const missing = required.filter((field) => !req.body?.[field])
    if (missing.length) {
      return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` })
    }
    const gameId = await gameModel.createGame({
      ...req.body,
      creatorId: req.userId,
    })
    const game = await gameModel.getGameById(gameId)
    res.status(201).json(game)
  } catch (error) {
    console.error('Failed to create game', error)
    res.status(500).json({
      message: 'Failed to create game',
      detail: error?.detail || error?.message,
      code: error?.code,
    })
  }
}

async function updateGame(req, res) {
  try {
    const existing = await gameModel.getGameById(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: 'Game not found' })
    }
    if (existing.creator_id !== req.userId) {
      return res.status(403).json({ message: 'Not allowed to update this game' })
    }
    const game = await gameModel.updateGame(req.params.id, req.body)
    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }
    await notifyParticipants(
      req.params.id,
      req.userId,
      req.body?.updateMessage || 'Game details have been updated. Please review the latest information.'
    )
    res.json(game)
  } catch (error) {
    console.error('Failed to update game', error)
    res.status(500).json({ message: 'Failed to update game' })
  }
}

async function deleteGame(req, res) {
  try {
    const game = await gameModel.getGameById(req.params.id)
    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }
    if (game.creator_id !== req.userId) {
      return res.status(403).json({ message: 'Not allowed to delete this game' })
    }
    const participants = await listGamePlayers(req.params.id)
    const hasJoined = participants.some((player) => player.status === 'joined')
    if (hasJoined) {
      return res.status(400).json({ message: 'Games with active participants cannot be deleted. Cancel instead.' })
    }
    await gameModel.deleteGame(req.params.id)
    res.sendStatus(204)
  } catch (error) {
    console.error('Failed to delete game', error)
    res.status(500).json({ message: 'Failed to delete game' })
  }
}

async function cancelGame(req, res) {
  try {
    const reason = (req.body?.reason || '').trim()
    if (!reason) {
      return res.status(400).json({ message: 'Cancellation reason is required' })
    }
    const game = await gameModel.getGameById(req.params.id)
    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }
    if (game.creator_id !== req.userId) {
      return res.status(403).json({ message: 'Not allowed to cancel this game' })
    }
    if (game.status === 'cancelled') {
      return res.status(400).json({ message: 'Game is already cancelled' })
    }
    const updated = await gameModel.cancelGame(req.params.id, reason)
    await notifyParticipants(req.params.id, req.userId, `Game cancelled: ${reason}`)
    res.json(updated)
  } catch (error) {
    console.error('Failed to cancel game', error)
    res.status(500).json({ message: 'Failed to cancel game' })
  }
}

async function getMyGames(req, res) {
  try {
    const games = await gameModel.listGames({ joinedUserId: req.userId })
    res.json({ data: games })
  } catch (error) {
    console.error('Failed to fetch user games', error)
    res.status(500).json({ message: 'Failed to load joined games' })
  }
}

module.exports = {
  discoverGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  cancelGame,
  getMyGames,
}
