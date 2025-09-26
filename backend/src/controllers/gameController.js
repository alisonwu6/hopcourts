const gameModel = require('../models/gameModel')
const waitForDB = require('../utils/db')
const { getCache, setCache, delCache } = require('../cache')

const handleCreateGame = async (req, res) => {
  try {
    const id = await gameModel.createGame(req.body)

    await delCache('games:all')

    res.status(201).json({ id })
  } catch (error) {
    console.error('Failed to create game:', error)
    res.status(500).send('Create failed')
  }
}

const handleGetGames = async (req, res) => {
  try {
    const { sport } = req.query
    console.log('sport', sport)

    const cacheKey = 'games:all'

    // check cache
    const cached = await getCache(cacheKey)
    if (cached) {
      console.log('Cache HIT: games list')
      return res.json(cached)
    }

    if (sport) {
      return await getFilteredGames(req, res)
    }

    const games = await gameModel.getAllGames()

    // save redis
    await setCache(cacheKey, games, 60)
    console.log('set cache')

    res.json(games)
  } catch (error) {
    res.status(500).send('Read failed')
  }
}

const handleGetGameById = async (req, res) => {
  try {
    const game = await gameModel.getGameById(req.params.id)
    if (!game) return res.status(404).send('Not found')
    res.json(game)
  } catch (error) {
    res.status(500).send('Read failed')
  }
}

const handleUpdateGame = async (req, res) => {
  try {
    const updatedFields = { ...req.body }

    // host_name is not allowed to modify for later use.
    delete updatedFields.host_name

    const success = await gameModel.updateGame(req.params.id, updatedFields)
    if (!success) {
      return res.status(404).send('Game not found or update failed')
    }
    res.sendStatus(204)
  } catch (error) {
    console.error('Failed to update game:', error)
    res.status(500).send('Update failed')
  }
}

const handleDeleteGame = async (req, res) => {
  try {
    await gameModel.deleteGame(req.params.id)
    res.sendStatus(204)
  } catch (error) {
    res.status(500).send('Delete failed')
  }
}

const getFilteredGames = async (req, res) => {
  // console.log(getFilteredGames, req.query)
  try {
    const db = await waitForDB()
    const { sport } = req.query

    let query = 'SELECT * FROM games'
    const params = []

    if (sport) {
      query += ' WHERE sport = ?'
      params.push(sport)
    }

    const [rows] = await db.execute(query, params)
    res.status(200).json(rows)
  } catch (error) {
    console.error('Error fetching games:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  handleCreateGame,
  handleGetGames,
  handleGetGameById,
  handleUpdateGame,
  handleDeleteGame,
}
