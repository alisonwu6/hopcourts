const { Pool } = require('pg')
const { env } = require('../src/config/env')

// Simple shared pg pool. Fail fast if config is missing.
const hasPgConfig =
  env.pg.host && env.pg.port && env.pg.database && env.pg.user && env.pg.password

const pool = hasPgConfig
  ? new Pool({
      host: env.pg.host,
      port: env.pg.port,
      database: env.pg.database,
      user: env.pg.user,
      password: env.pg.password,
      ssl: env.pg.sslmode === 'require',
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
