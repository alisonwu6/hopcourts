const { query } = require('../src/lib/db')

async function getUserById(id) {
  const { rows } = await query(
    `select id, email, username, display_name, city_key, nationality_key, age_range_key, gender, vibe_key, bio, avatar_url, role, created_at, updated_at, onboarding_completed_at, is_anonymous
     from public.users where id = $1`,
    [id]
  )
  return rows[0] || null
}

async function getUserByUsername(username) {
  const { rows } = await query(
    `select id, username, display_name, city_key, nationality_key, age_range_key, gender, vibe_key, bio, avatar_url, created_at, updated_at, onboarding_completed_at
     from public.users where username = $1`,
    [username]
  )
  return rows[0] || null
}

async function upsertUser(user) {
  const sql = `
    insert into public.users (
      id, email, username, display_name, city_key, nationality_key, age_range_key, gender, vibe_key, bio, avatar_url, onboarding_completed_at
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
    )
    on conflict (id) do update set
      email = coalesce(excluded.email, users.email),
      username = coalesce(excluded.username, users.username),
      display_name = excluded.display_name,
      city_key = excluded.city_key,
      nationality_key = excluded.nationality_key,
      age_range_key = excluded.age_range_key,
      gender = excluded.gender,
      vibe_key = excluded.vibe_key,
      bio = excluded.bio,
      avatar_url = excluded.avatar_url,
      onboarding_completed_at = coalesce(excluded.onboarding_completed_at, users.onboarding_completed_at)
    returning *
  `
  const params = [
    user.id,
    user.email, // Required for Insert
    user.username || null,
    user.display_name,
    user.city_key ?? null,
    user.nationality_key ?? null,
    user.age_range_key ?? null,
    user.gender ?? null,
    user.vibe_key ?? null,
    user.bio ?? null,
    user.avatar_url ?? null,
    user.onboarding_completed_at ?? null
  ]
  const { rows } = await query(sql, params)
  return rows[0]
}

async function findUserByEmail(email) {
  const { rows } = await query(
    `select id, username, display_name, city_key, nationality_key, age_range_key, gender, vibe_key, bio, avatar_url, role, created_at, updated_at, email
     from public.users where email = $1`,
    [email]
  )
  return rows[0] || null
}

async function createUserFromSupabaseProfile(profile) {
  const sql = `
    insert into public.users (
      id, email, display_name, username, city_key, nationality_key, gender, avatar_url, is_anonymous
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    )
    returning *
  `
  const fallbackName = profile.email ? profile.email.split('@')[0] : 'Guest'
  const params = [
    profile.id, // Must provide Supabase Auth UUID
    profile.email || null,
    profile.fullName || fallbackName,
    profile.username || null,
    profile.city || null,
    profile.nationalityKey || null,
    profile.gender || null,
    profile.avatarUrl || null,
    profile.isAnonymous === true,
  ]
  const { rows } = await query(sql, params)
  return rows[0]
}

async function deleteUser(id) {
  const { rowCount } = await query('delete from public.users where id = $1', [id])
  return rowCount > 0
}

/**
 * addRoleToUser — appends a role to the user's TEXT[] role column.
 * Safe to call multiple times (idempotent: no-op if role already present).
 */
async function addRoleToUser(userId, role) {
  const { rows } = await query(
    `UPDATE public.users
     SET role = array_append(role, $2), updated_at = NOW()
     WHERE id = $1 AND NOT (role @> ARRAY[$2]::text[])
     RETURNING *`,
    [userId, role]
  )
  return rows[0] || null
}

module.exports = { 
  getUserById, 
  getUserByUsername, 
  upsertUser,
  findUserByEmail,
  createUserFromSupabaseProfile,
  deleteUser,
  addRoleToUser,
}
