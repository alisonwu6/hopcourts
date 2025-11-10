const { Pool } = require('pg')

let pool

function buildPoolConfig() {
  const sslMode = (process.env.PGSSLMODE || '').toLowerCase()
  let ssl
  if (sslMode && sslMode !== 'disable' && sslMode !== 'allow') {
    ssl = { rejectUnauthorized: sslMode === 'verify-full' }
  } else if (sslMode === 'require') {
    ssl = { rejectUnauthorized: false }
  } else if (sslMode === 'allow') {
    ssl = { rejectUnauthorized: false }
  }

  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl,
    max: Number(process.env.PG_POOL_SIZE || 10),
  }
}

async function waitForDB() {
  if (pool) return pool

  const config = buildPoolConfig()

  while (!pool) {
    try {
      pool = new Pool(config)
      pool.on('error', (err) => {
        console.error('[db] idle client error', err.message)
      })
      pool.execute = async (text, params = []) => {
        const res = await pool.query(text, params)
        return [res.rows, res]
      }
      const client = await pool.connect()
      console.log('✅ Connected to Postgres')
      client.release()
    } catch (err) {
      console.error('⏳ Waiting for Postgres to be ready...', err.message)
      pool = null
      await new Promise((res) => setTimeout(res, 2000))
    }
  }

  return pool
}

module.exports = waitForDB
