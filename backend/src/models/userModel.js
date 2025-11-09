const bcrypt = require('bcrypt')
const waitForDB = require('../utils/db')

const HASH_ROUNDS = 10

async function hashPassword(password) {
  return bcrypt.hash(password, HASH_ROUNDS)
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
  const db = await waitForDB()
  const passwordHash = await hashPassword(password)
  const [result] = await db.execute(
    `INSERT INTO users (full_name, email, password_hash, username, role, city, gender)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fullName, email, passwordHash, username || null, role, city || null, gender || null]
  )
  return result.insertId
}

async function findUserByEmail(email) {
  const db = await waitForDB()
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email])
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

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  verifyPassword,
  updateUser,
}
