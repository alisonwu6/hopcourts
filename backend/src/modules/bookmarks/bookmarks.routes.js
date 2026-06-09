const express = require('express')
const { handleToggleBookmark, handleGetBookmarks } = require('./bookmarks.controller')
const { verifyToken } = require('../../middleware/verifyToken')

const router = express.Router()

router.post('/sessions/:sessionId/bookmark', verifyToken, handleToggleBookmark)
router.delete('/sessions/:sessionId/bookmark', verifyToken, handleToggleBookmark)
router.get('/me/bookmarks', verifyToken, handleGetBookmarks)

module.exports = { bookmarksRouter: router }
