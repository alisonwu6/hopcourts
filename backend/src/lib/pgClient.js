const { Pool } = require('pg')
const { env } = require('../config/env')

const hasPgConfig =
  env.pg.host &&
  env.pg.port &&
  env.pg.database &&
  env.pg.user &&
  env.pg.password

const pgPool = hasPgConfig
  ? new Pool({
      host: env.pg.host,
      port: env.pg.port,
      database: env.pg.database,
      user: env.pg.user,
      password: env.pg.password,
      ssl: env.pg.sslmode === 'require',
    })
  : null

module.exports = { pgPool, hasPgConfig }
