const { ok } = require('../../lib/respond')
const { toggleBookmark, getBookmarkIds } = require('./bookmarks.service')

function resolveUserId(req) {
  return req.userId || req.authUser?.id || req.user?.id
}

async function handleToggleBookmark(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const { sessionId } = req.params
    const data = await toggleBookmark({ userId, sessionId })
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

async function handleGetBookmarks(req, res, next) {
  try {
    const userId = resolveUserId(req)
    const data = await getBookmarkIds({ userId })
    return ok(res, data)
  } catch (err) {
    next(err)
  }
}

module.exports = { handleToggleBookmark, handleGetBookmarks }
