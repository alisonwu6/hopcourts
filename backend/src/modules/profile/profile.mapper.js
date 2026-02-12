function mapUserProfile(payload = {}) {
  const user = payload.user || {}
  const sportsRaw = Array.isArray(payload.sports) ? payload.sports : []
  const sports = sportsRaw
    .map((s) => {
      const kind = String(s.kind || '').toUpperCase() || 'FAVORITE'
      const sportKey = s.sport_key || s.sportKey || s.key || s.label
      if (!sportKey) return null
      return { sport_key: sportKey, kind }
    })
    .filter(Boolean)

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username || null,
    display_name: user.display_name || null,
    avatar_url: user.avatar_url || null,
    bio: user.bio || null,
    city_key: user.city_key || null,
    vibe_key: user.vibe_key || null,
    age_range_key: user.age_range_key || null,
    gender: user.gender || null,
    onboarding_completed_at: user.onboarding_completed_at || null,
    created_at: user.created_at,
    updated_at: user.updated_at,
    teammate_count: user.teammate_count,
  }

  return { user: safeUser, sports }
}

module.exports = { mapUserProfile }
