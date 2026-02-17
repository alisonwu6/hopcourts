const { Pool } = require('pg')

// Shared pg pool. Fail fast if config is missing.
const hasPgConfig =
  process.env.PGHOST &&
  process.env.PGPORT &&
  process.env.PGDATABASE &&
  process.env.PGUSER &&
  process.env.PGPASSWORD

const isProd = process.env.NODE_ENV === 'production'

const pool = hasPgConfig
  ? new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: isProd ? { rejectUnauthorized: false } : false,
    })
  : null

function requirePool() {
  if (!pool) {
    throw new Error('Postgres is not configured (missing PG env vars).')
  }
  return pool
}

async function query(text, params) {
  const client = requirePool()
  return client.query(text, params)
}

module.exports = {
  query,
  getPool: requirePool,
}
