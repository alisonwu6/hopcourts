const { query } = require('../../lib/db')
const usersModel = require('../../../models/users.model')
const userSportsModel = require('../../../models/userSports.model')
const userPreferencesModel = require('../../../models/userPreferences.model')
const participantsModel = require('../../../models/participants.model')
const sessionsModel = require('../../../models/sessions.model')
const notificationsService = require('../notifications/notifications.service')
const { Errors } = require('../../lib/errors')
const supabase = require('../../utils/supabase')

function resolveUserId(req) {
  return (
    req.userId ||
    req.authUser?.id ||
    req.user?.id ||
    req.headers['x-user-id'] ||
    req.headers['x-userid']
  )
}

async function getProfile(userId) {
  let user = await usersModel.getUserById(userId)
  
  if (!user) {
    // Attempt Auto-Heal: user might exist in Auth but not in DB (e.g. after DB reset)
    console.log(`[getProfile] User ${userId} not found in DB, attempting auto-heal...`)
    try {
      // upsertProfile has logic to fetch email/avatar from Supabase if missing
      const result = await upsertProfile(userId, {}) 
      user = result.user
    } catch (err) {
      console.error(`[getProfile] Auto-heal failed: ${err.message}`)
       // If auto-heal fails, then truly not found
      throw Errors.notFound('User not found')
    }
  }

  const sports = await userSportsModel.listUserSports(userId)
  const teammate_count = await participantsModel.countTeammates(userId)
  const joined_count = await participantsModel.countJoinedSessions(userId)
  const hosted_count = await sessionsModel.countHostedSessions(userId)
  return {
    user: { ...user, teammate_count, joined_count, hosted_count },
    sports
  }
}

async function getProfileByUsername(username) {
  const user = await usersModel.getUserByUsername(username)
  if (!user) throw Errors.notFound('User not found')
  const sports = await userSportsModel.listUserSports(user.id)
  const teammate_count = await participantsModel.countTeammates(user.id)
  const joined_count = await participantsModel.countJoinedSessions(user.id)
  const hosted_count = await sessionsModel.countHostedSessions(user.id)
  return { user: { ...user, teammate_count, joined_count, hosted_count }, sports }
}

async function getProfileSessionsByUsername(username, { role = 'hosted', time = 'upcoming', limit = 20, offset = 0 } = {}) {
  const user = await usersModel.getUserByUsername(username)
  if (!user) throw Errors.notFound('User not found')

  let items = []
  if (time === 'history') {
    items = await sessionsModel.listMyHistorySessions({
      userId: user.id,
      role,
      limit,
      offset,
    })
  } else {
    const upcomingItems = await sessionsModel.listMyUpcomingSessions({
      userId: user.id,
      role,
    })
    items = upcomingItems.slice(offset, offset + limit)
  }

  return {
    items,
    page: {
      limit,
      offset,
      has_more: items.length === limit,
    },
  }
}

async function upsertProfile(userId, body = {}) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const current = (await usersModel.getUserById(userId)) || {}
  console.log('[upsertProfile] Current User:', JSON.stringify(current, null, 2))
  const normalizedUsername = typeof body.username === 'string'
    ? body.username.trim().toLowerCase()
    : body.username

  // Prepare user data
  let email = body.email || (body.auth_user && body.auth_user.email) || current.email
  // Use 'in' checks so an explicit null/'' in the request intentionally clears the avatar
  const avatarExplicitlySet = 'avatar_url' in body || 'avatar' in body
  let avatarUrl =
      'avatar_url' in body ? body.avatar_url :
      'avatar' in body ? body.avatar :
      current.avatar_url ||
      (body.auth_user && body.auth_user.user_metadata && body.auth_user.user_metadata.picture) ||
      (body.auth_user && body.auth_user.avatar_url) ||
      null

  let nameFromAuth =
      (body.auth_user && body.auth_user.user_metadata && (body.auth_user.user_metadata.full_name || body.auth_user.user_metadata.name)) ||
      null

  // If email is missing (new user via API without full payload), try fetching from Supabase
  if ((!email || !nameFromAuth) && supabase) {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId)
      if (data && data.user) {
        if (!email) email = data.user.email

        // Sync avatar from auth metadata only for brand-new users (no existing DB record).
        // For existing users, current.avatar_url is the source of truth — even if null.
        const isNewUser = !current?.id
        if (isNewUser && !avatarExplicitlySet && !avatarUrl && data.user.user_metadata?.picture) {
           avatarUrl = data.user.user_metadata.picture
        }
        if (isNewUser && !avatarExplicitlySet && !avatarUrl && data.user.user_metadata?.avatar_url) {
           avatarUrl = data.user.user_metadata.avatar_url
        }

        // Sync name if missing
        if (!nameFromAuth && data.user.user_metadata) {
          nameFromAuth = data.user.user_metadata.full_name || data.user.user_metadata.name
        }
      } else if (error) {
        console.warn(`[upsertProfile] Failed to fetch Supabase user ${userId}:`, error.message)
      }
    } catch (err) {
      console.error('[upsertProfile] Error fetching Supabase user:', err)
    }
  }

  // Check for sports presence (Incoming or Existing)
  const incomingFavs = Array.isArray(body.favorite_sports) ? body.favorite_sports : []
  const incomingTrying = Array.isArray(body.trying_sports) ? body.trying_sports : []
  
  // If sports field is used (legacy/bulk), it might contain both
  const incomingBulk = Array.isArray(body.sports) ? body.sports : []
  const bulkFavs = incomingBulk.filter(s => s.kind === 'FAVORITE' || s.type === 'FAVORITE')
  const bulkTrying = incomingBulk.filter(s => s.kind === 'TRYING' || s.type === 'TRYING')

  let hasFavorite = (incomingFavs.length + bulkFavs.length) > 0
  let hasTrying = (incomingTrying.length + bulkTrying.length) > 0

  if (!hasFavorite || !hasTrying) {
     const existingSports = await userSportsModel.listUserSports(userId)
     if (!hasFavorite) hasFavorite = existingSports.some(s => s.kind === 'FAVORITE')
     if (!hasTrying) hasTrying = existingSports.some(s => s.kind === 'TRYING')
  }

  const hasBothSports = hasFavorite && hasTrying

  // Strict Onboarding Rule: All fields including bio
  const isProfileComplete =
    (body.display_name || current.display_name || nameFromAuth) &&
    (normalizedUsername || current.username) &&
    (body.city_key ?? current.city_key) &&
    (body.gender ?? current.gender) &&
    (body.vibe_key ?? current.vibe_key) &&
    (body.bio ?? current.bio) &&
    hasBothSports

  const user = await usersModel.upsertUser({
    id: userId,
    email: email, 
    username: normalizedUsername || current.username || null,
    display_name:
      body.display_name ||
      current.display_name ||
      nameFromAuth ||
      '新夥伴',
    city_key: body.city_key ?? current.city_key ?? null,
    nationality_key: body.nationality_key ?? current.nationality_key ?? null,
    age_range_key: body.age_range_key ?? current.age_range_key ?? null,
    gender: body.gender ?? current.gender ?? null,
    vibe_key: body.vibe_key ?? current.vibe_key ?? null,
    bio: body.bio ?? current.bio ?? null,
    avatar_url: avatarUrl,
    onboarding_completed_at: 
      current.onboarding_completed_at || 
      (isProfileComplete ? new Date() : null)
  })

  const sportsInput = Array.isArray(body.sports) ? body.sports : []
  const favSports = Array.isArray(body.favorite_sports) ? body.favorite_sports : []
  const tryingSports = Array.isArray(body.trying_sports) ? body.trying_sports : []
  const normalizedSports = [
    ...sportsInput.map((s) => ({
      sport_key: s.sport_key || s.sportKey || s.key,
      kind: s.kind || s.type || 'FAVORITE',
    })),
    ...favSports.map((key) => ({ sport_key: key, kind: 'FAVORITE' })),
    ...tryingSports.map((key) => ({ sport_key: key, kind: 'TRYING' })),
  ].filter((s) => s.sport_key)

  let sports
  if (normalizedSports.length > 0) {
    sports = await userSportsModel.replaceUserSports(userId, normalizedSports)
  } else {
    // 沒有提供運動相關欄位時，不要清空既有運動設定
    sports = await userSportsModel.listUserSports(userId)
  }

  return { user, sports }
}

async function getPreferences(userId) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const prefs = await userPreferencesModel.getPreferences(userId)
  return prefs || {}
}

async function upsertPreferences(userId, body = {}) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const prefs = await userPreferencesModel.upsertPreferences(userId, {
    preferred_time: body.preferred_time || body.preferredTime || null,
    sessions_per_week: body.sessions_per_week ?? body.sessionsPerWeek ?? null,
    day_slots: body.day_slots || body.daySlots || null,
  })
  const favSports = Array.isArray(body.favorite_sports) ? body.favorite_sports : []
  const tryingSports = Array.isArray(body.trying_sports) ? body.trying_sports : []
  const sportsPayload = [
    ...favSports.map((key) => ({ sport_key: key, kind: 'FAVORITE' })),
    ...tryingSports.map((key) => ({ sport_key: key, kind: 'TRYING' })),
  ]
  if (sportsPayload.length) {
    await userSportsModel.replaceUserSports(userId, sportsPayload)
  }
  return prefs
}

async function getOnboardingStatus(userId) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  const user = await usersModel.getUserById(userId)
  const missing = []
  if (!user?.display_name) missing.push('display_name')
  if (!user?.city_key) missing.push('city_key')
  if (!user?.vibe_key) missing.push('vibe_key')
  if (!user?.age_range_key) missing.push('age_range_key')
  if (!user?.bio) missing.push('bio')
  const sports = await userSportsModel.listUserSports(userId)
  if (!sports.some(s => s.kind === 'FAVORITE')) missing.push('favorite_sports')
  if (!sports.some(s => s.kind === 'TRYING')) missing.push('trying_sports')
  return { is_complete: missing.length === 0, missing_fields: missing }
}

async function getStats(userId) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  // Placeholder stats
  return {
    sessions_joined: 0,
    sessions_completed: 0,
    high_fives_given: 0,
    high_fives_received: 0,
  }
}

async function deleteAccount(userId, { force = false } = {}) {
  if (!userId) throw Errors.unauthenticated('User id is required')

  // 1. Warn if any event is currently ongoing — user can override with force: true
  if (!force) {
    const { rows: ongoingEvents } = await query(
      `SELECT id FROM public.sessions
       WHERE host_user_id = $1
         AND status NOT IN ('cancelled', 'completed')
         AND starts_at <= NOW()
         AND ends_at >= NOW()
       LIMIT 1`,
      [userId]
    )

    if (ongoingEvents.length > 0) {
      const err = Errors.conflict('You are currently hosting an active event.')
      err.code = 'ONGOING_EVENT'
      throw err
    }
  }

  // 2. Fetch upcoming hosted sessions before cancelling (need titles + IDs for notifications)
  const { rows: upcomingSessions } = await query(
    `SELECT id, title FROM public.sessions
     WHERE host_user_id = $1
       AND status NOT IN ('cancelled', 'completed')
       AND starts_at > NOW()`,
    [userId]
  )

  if (upcomingSessions.length > 0) {
    const sessionIds = upcomingSessions.map((s) => s.id)

    // Fetch all participants across those sessions
    const { rows: participants } = await query(
      `SELECT session_id, user_id FROM public.session_participants
       WHERE session_id = ANY($1) AND user_id != $2`,
      [sessionIds, userId]
    )

    // Cancel the sessions
    await query(
      `UPDATE public.sessions
       SET status = 'cancelled'
       WHERE id = ANY($1)`,
      [sessionIds]
    )

    // Notify each participant
    const sessionMap = new Map(upcomingSessions.map((s) => [s.id, s.title]))
    participants.forEach((p) => {
      notificationsService.createNotification({
        recipient_user_id: p.user_id,
        actor_user_id: null,
        type: 'session_cancelled',
        entity_type: 'session',
        entity_id: p.session_id,
        title: 'Event cancelled',
        message: `"${sessionMap.get(p.session_id)}" was cancelled by the host.`,
        metadata: {},
      }).catch((err) => console.error('[deleteAccount] Notify cancel failed', err))
    })
  }

  // 3. Soft delete — clear PII, keep row so event history stays intact
  // GDPR: clear PII on deletion, preserve row for event history
  await query(
    `UPDATE public.users
     SET deleted_at = NOW(),
         email = NULL,
         username = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [userId]
  )

  // 4. Remove from Supabase Auth so they can no longer log in
  if (supabase) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) {
        console.warn(`[deleteAccount] Supabase Auth delete failed for ${userId}:`, error.message)
      } else {
        console.log(`[deleteAccount] Soft deleted user ${userId} from Supabase Auth`)
      }
    } catch (err) {
      console.error('[deleteAccount] Supabase Auth error:', err)
    }
  }

  return { success: true }
}

async function getTeammates(userId) {
  if (!userId) throw Errors.unauthenticated('User id is required')
  return await participantsModel.listTeammates(userId)
}

module.exports = {
  resolveUserId,
  getProfile,
  getProfileByUsername,
  getProfileSessionsByUsername,
  upsertProfile,
  getPreferences,
  upsertPreferences,
  getOnboardingStatus,
  getStats,
  deleteAccount,
  getTeammates,
}
