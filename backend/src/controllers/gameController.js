const gameModel = require('../models/gameModel')

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
    res.status(500).json({ message: 'Failed to create game' })
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
    await gameModel.deleteGame(req.params.id)
    res.sendStatus(204)
  } catch (error) {
    console.error('Failed to delete game', error)
    res.status(500).json({ message: 'Failed to delete game' })
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
  getMyGames,
}
