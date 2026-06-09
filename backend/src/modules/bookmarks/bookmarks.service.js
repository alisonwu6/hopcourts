const { AppError } = require('../../lib/errors')
const bookmarksModel = require('../../../models/bookmarks.model')
const sessionsModel = require('../../../models/sessions.model')

async function toggleBookmark({ userId, sessionId }) {
  if (!userId) throw new AppError({ code: 'UNAUTHENTICATED', message: 'Login required', status: 401 })

  const session = await sessionsModel.getSessionById(sessionId)
  if (!session) throw new AppError({ code: 'SESSION_NOT_FOUND', message: 'Session not found', status: 404 })

  const already = await bookmarksModel.isBookmarked({ userId, sessionId })
  if (already) {
    await bookmarksModel.removeBookmark({ userId, sessionId })
    return { bookmarked: false }
  }
  await bookmarksModel.addBookmark({ userId, sessionId })
  return { bookmarked: true }
}

async function getBookmarkIds({ userId }) {
  if (!userId) throw new AppError({ code: 'UNAUTHENTICATED', message: 'Login required', status: 401 })
  const ids = await bookmarksModel.listBookmarkIds({ userId })
  return { ids }
}

module.exports = { toggleBookmark, getBookmarkIds }
