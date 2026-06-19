const { requireRoles } = require('./requireRoles')

/**
 * verifyAdmin
 *
 * Alias for requireRoles('admin') — kept as a named export so existing
 * route files don't need to change.
 */
const verifyAdmin = requireRoles('admin')

module.exports = { verifyAdmin }
