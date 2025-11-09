const { createMessage, listMessages } = require('../models/messageModel')
const { getGameById } = require('../models/gameModel')
const { listGamePlayers } = require('../models/gameJoinModel')

async function getMessages(req, res) {
  try {
    const messages = await listMessages(req.params.id)
    res.json({ messages })
  } catch (error) {
    console.error('Failed to load messages', error)
    res.status(500).json({ message: 'Unable to load messages' })
  }
}

async function postMessage(req, res) {
  try {
    const { body } = req.body || {}
    if (!body) {
      return res.status(400).json({ message: 'Message body is required' })
    }
    const game = await getGameById(req.params.id)
    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }
    const participants = await listGamePlayers(req.params.id)
    const allowed =
      game.creator_id === req.userId ||
      participants.some((player) => player.player_id === req.userId && player.status === 'joined')
    if (!allowed) {
      return res.status(403).json({ message: 'Join the game to send messages' })
    }
    const messageId = await createMessage({
      gameId: req.params.id,
      senderId: req.userId,
      body,
    })
    const messages = await listMessages(req.params.id)
    const created = messages.find((msg) => msg.id === messageId) || null
    res.status(201).json(created)
  } catch (error) {
    console.error('Failed to create message', error)
    res.status(500).json({ message: 'Unable to send message' })
  }
}

module.exports = {
  getMessages,
  postMessage,
}
