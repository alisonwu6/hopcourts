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
    const [result] = await db.execute(
      `INSERT INTO users (full_name, email, password_hash, username, role, city, gender)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
    return result.insertId
  }

  try {
    return await execInsert(username)
  } catch (err) {
    const duplicateUsername =
      err?.code === 'ER_DUP_ENTRY' && /users\.username/.test(err?.message || '')
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
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [normalizedEmail])
  return rows[0]
}

async function findUserByUsername(username) {
  const db = await waitForDB()
  const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username])
  return rows[0]
}

async function findUserById(id) {
  const db = await waitForDB()
  const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id])
  return rows[0]
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

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ')
  const values = entries.map(([, value]) => value)
  values.push(id)

  const db = await waitForDB()
  await db.execute(`UPDATE users SET ${setClause} WHERE id = ?`, values)
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
      err?.code === 'ER_DUP_ENTRY' && /users\.email/.test(err?.message || '')
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
