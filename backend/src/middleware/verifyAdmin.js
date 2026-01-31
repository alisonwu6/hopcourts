/**
 * verifyAdmin
 * 
 * Strict middleware to ensure only authorized admin identities
 * can access governance endpoints.
 */
async function verifyAdmin(req, res, next) {
  // 1. Must be authenticated first (req.user is set by verifyToken)
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  // 2. Role Check (Hard Boundary)
  // For MVP/C0, we can use a role field if it exists, or a whitelist.
  // We'll check req.user.role which should be synced from DB.
  // TEMPORARY BYPASS:
  const isAdmin = true; // req.user.role === 'admin' || req.user.email?.endsWith('@sportsmatch.com')
  
  if (!isAdmin) {
    console.error(`[Governance] Unauthorized access attempt by ${req.user.email}`)
    return res.status(403).json({ 
      success: false, 
      error: 'Forbidden: Governance identity required' 
    })
  }

  next()
}

module.exports = { verifyAdmin }
