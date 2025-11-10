const bcrypt = require('bcrypt')
const crypto = require('crypto')
const waitForDB = require('../utils/db')

const HASH_ROUNDS = 10

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : null
}

async function hashPassword(password) {
  return bcrypt.hash(password, HASH_ROUNDS)
}

async function insertUserRow({
  fullName,
  email,
  passwordHash,
  username,
  role = 'player',
  city,
  gender,
}) {
  const db = await waitForDB()
  const normalizedEmail = normalizeEmail(email)

  const execInsert = async (nameForInsert) => {
    const res = await db.query(
      `INSERT INTO users (full_name, email, password_hash, username, role, city, gender)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        fullName,
        normalizedEmail,
        passwordHash,
        nameForInsert || null,
        role,
        city || null,
        gender || null,
      ]
    )
    return res.rows[0]?.id
  }

  try {
    return await execInsert(username)
  } catch (err) {
    const duplicateUsername =
      err?.code === '23505' && (err?.constraint === 'users_username_key' || /users_username_key/.test(err?.detail || ''))
    if (duplicateUsername) {
      return execInsert(null)
    }
    throw err
  }
}

async function createUser({
  fullName,
  email,
  password,
  username,
  role = 'player',
  city,
  gender,
}) {
  const passwordHash = await hashPassword(password)
  return insertUserRow({
    fullName,
    email,
    passwordHash,
    username,
    role,
    city,
    gender,
  })
}

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return null
  const db = await waitForDB()
  const res = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail])
  return res.rows[0] || null
}

async function findUserByUsername(username) {
  const db = await waitForDB()
  const res = await db.query('SELECT * FROM users WHERE username = $1', [username])
  return res.rows[0] || null
}

async function findUserById(id) {
  const db = await waitForDB()
  const res = await db.query('SELECT * FROM users WHERE id = $1', [id])
  return res.rows[0] || null
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}

async function updateUser(id, updates) {
  if (!updates || Object.keys(updates).length === 0) return null

  const allowedFields = [
    'full_name',
    'username',
    'city',
    'gender',
    'bio',
    'avatar_url',
    'motivation',
    'role',
  ]

  const entries = Object.entries(updates).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
  if (entries.length === 0) return null

  const values = entries.map(([, value]) => value)
  values.push(id)

  const db = await waitForDB()
  const assignments = entries
    .map(([key], idx) => `${key} = $${idx + 1}`)
    .join(', ')
  await db.query(`UPDATE users SET ${assignments} WHERE id = $${entries.length + 1}`, values)
  return findUserById(id)
}

async function createUserFromSupabaseProfile({
  email,
  fullName,
  username,
  role = 'player',
  city,
  gender,
}) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    throw new Error('Supabase user is missing an email address')
  }
  const safeName =
    fullName && fullName.trim().length > 0 ? fullName.trim() : normalizedEmail.split('@')[0]
  const randomPassword = crypto.randomBytes(32).toString('hex')
  const passwordHash = await hashPassword(randomPassword)
  try {
    const insertId = await insertUserRow({
      fullName: safeName,
      email: normalizedEmail,
      passwordHash,
      username,
      role,
      city,
      gender,
    })
    return findUserById(insertId)
  } catch (err) {
    const duplicateEmail =
      err?.code === '23505' && (err?.constraint === 'users_email_key' || /users_email_key/.test(err?.detail || ''))
    if (duplicateEmail) {
      return findUserByEmail(normalizedEmail)
    }
    throw err
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  verifyPassword,
  updateUser,
  createUserFromSupabaseProfile,
  normalizeEmail,
}
