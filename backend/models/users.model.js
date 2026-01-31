const { query } = require('../db/client')

async function getUserById(id) {
  const { rows } = await query(
    `select id, username, display_name, legal_name, country_key, city_key, age_range_key, vibe_key, bio, avatar_url, created_at, updated_at
     from public.users where id = $1`,
    [id]
  )
  return rows[0] || null
}

async function getUserByUsername(username) {
  const { rows } = await query(
    `select id, username, display_name, legal_name, country_key, city_key, age_range_key, vibe_key, bio, avatar_url, created_at, updated_at
     from public.users where username = $1`,
    [username]
  )
  return rows[0] || null
}

async function upsertUser(user) {
  const sql = `
    insert into public.users (
      id, username, display_name, legal_name, country_key, city_key, age_range_key, vibe_key, bio, avatar_url
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
    )
    on conflict (id) do update set
      username = excluded.username,
      display_name = excluded.display_name,
      legal_name = excluded.legal_name,
      country_key = excluded.country_key,
      city_key = excluded.city_key,
      age_range_key = excluded.age_range_key,
      vibe_key = excluded.vibe_key,
      bio = excluded.bio,
      avatar_url = excluded.avatar_url
    returning *
  `
  const params = [
    user.id,
    user.username,
    user.display_name,
    user.legal_name ?? null,
    user.country_key ?? null,
    user.city_key ?? null,
    user.age_range_key ?? null,
    user.vibe_key ?? null,
    user.bio ?? null,
    user.avatar_url ?? null,
  ]
  const { rows } = await query(sql, params)
  return rows[0]
}

async function findUserByEmail(email) {
  const { rows } = await query(
    `select id, username, display_name, legal_name, country_key, city_key, age_range_key, vibe_key, bio, avatar_url, created_at, updated_at, email
     from public.users where email = $1`,
    [email]
  )
  return rows[0] || null
}

async function createUserFromSupabaseProfile(profile) {
  const sql = `
    insert into public.users (
      email, display_name, username, city_key, gender
    ) values (
      $1, $2, $3, $4, $5
    )
    returning *
  `
  const params = [
    profile.email,
    profile.fullName || profile.email.split('@')[0],
    profile.username || null,
    profile.city || null,
    profile.gender || null,
  ]
  const { rows } = await query(sql, params)
  return rows[0]
}

module.exports = { 
  getUserById, 
  getUserByUsername, 
  upsertUser,
  findUserByEmail,
  createUserFromSupabaseProfile
}
