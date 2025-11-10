const supabase = require('../utils/supabase')

async function auth(req, res, next) {
  if (!supabase) {
    return res
      .status(500)
      .json({ error: 'Supabase credentials are not configured on the API' })
  }

  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' })

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const user = data.user
    const groups = Array.isArray(user.app_metadata?.groups)
      ? [...user.app_metadata.groups]
      : []
    const role = user.app_metadata?.role || user.user_metadata?.role || null
    if (role && !groups.includes(role)) groups.push(role)

    req.user = {
      id: user.id,
      email: user.email,
      username:
        user.user_metadata?.username ||
        user.email?.split('@')?.[0] ||
        user.id,
      groups,
      role,
      appMetadata: user.app_metadata,
      userMetadata: user.user_metadata,
    }

    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function requireGroup(...allowed) {
  return (req, res, next) => {
    const groups = req.user?.groups || []
    const ok = groups.some((g) => allowed.includes(g))
    if (!ok)
      return res
        .status(403)
        .json({ message: `Forbidden: ${allowed.join(' or ')} only` })
    next()
  }
}

module.exports = auth
module.exports.requireGroup = requireGroup
