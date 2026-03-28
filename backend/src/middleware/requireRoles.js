/**
 * requireRoles(...allowedRoles)
 *
 * Factory middleware — returns an Express handler that allows only users
 * who hold AT LEAST ONE of the specified roles.
 * Must run AFTER verifyToken so req.user is already populated.
 *
 * req.user.role is a TEXT[] from Postgres, e.g. ['player', 'venue']
 *
 * Usage:
 *   router.use(verifyToken, requireRoles('admin'))
 *   router.get('/venue/settings', verifyToken, requireRoles('venue', 'admin'), handler)
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    // role is TEXT[] in Postgres; the pg driver returns it as a JS array
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role]
    const hasRole = allowedRoles.some(r => userRoles.includes(r))

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: requires role ${allowedRoles.join(' or ')}`,
      })
    }

    next()
  }
}

module.exports = { requireRoles }
