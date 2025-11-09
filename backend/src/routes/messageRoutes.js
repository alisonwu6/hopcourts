const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getMessages, postMessage } = require('../controllers/messageController')

router.get('/games/:id/messages', verifyToken, getMessages)
router.post('/games/:id/messages', verifyToken, postMessage)

module.exports = router
