const { query } = require('../db/client')

async function getUserById(id) {
  const { rows } = await query(
    `select id, username, display_name, legal_name, country_key, city_key, age_range_key, gender, vibe_key, bio, avatar_url, created_at, updated_at, username_updated_count
     from public.users where id = $1`,
    [id]
  )
  return rows[0] || null
}

async function getUserByUsername(username) {
  const { rows } = await query(
    `select id, username, display_name, legal_name, country_key, city_key, age_range_key, gender, vibe_key, bio, avatar_url, created_at, updated_at, username_updated_count
     from public.users where username = $1`,
    [username]
  )
  return rows[0] || null
}

async function upsertUser(user) {
  const sql = `
    insert into public.users (
      id, username, display_name, legal_name, country_key, city_key, age_range_key, gender, vibe_key, bio, avatar_url, username_updated_count
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, $12
    )
    on conflict (id) do update set
      username = coalesce(excluded.username, users.username),
      display_name = excluded.display_name,
      legal_name = excluded.legal_name,
      country_key = excluded.country_key,
      city_key = excluded.city_key,
      age_range_key = excluded.age_range_key,
      gender = excluded.gender,
      vibe_key = excluded.vibe_key,
      bio = excluded.bio,
      avatar_url = excluded.avatar_url,
      username_updated_count = case 
        when excluded.username is not null and (users.username is null or excluded.username <> users.username) 
        then users.username_updated_count + 1 
        else users.username_updated_count 
      end
    returning *
  `
  const params = [
    user.id,
    user.username || null,
    user.display_name,
    user.legal_name ?? null,
    user.country_key ?? null,
    user.city_key ?? null,
    user.age_range_key ?? null,
    user.gender ?? null,
    user.vibe_key ?? null,
    user.bio ?? null,
    user.avatar_url ?? null,
    user.username_updated_count || 0
  ]
  const { rows } = await query(sql, params)
  return rows[0]
}

async function findUserByEmail(email) {
  const { rows } = await query(
    `select id, username, display_name, legal_name, country_key, city_key, age_range_key, gender, vibe_key, bio, avatar_url, created_at, updated_at, email
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

async function deleteUser(id) {
  const { rowCount } = await query('delete from public.users where id = $1', [id])
  return rowCount > 0
}

module.exports = { 
  getUserById, 
  getUserByUsername, 
  upsertUser,
  findUserByEmail,
  createUserFromSupabaseProfile,
  deleteUser
}
