const express = require('express')
const cors = require('cors')
const pinoHttp = require('pino-http')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const { version } = require('../package.json')
const { env } = require('./config/env')
const { v1Router } = require('./routes/v1')
const { errorHandler } = require('./middleware/errorHandler')
const logger = require('./lib/logger')


const isProduction = process.env.NODE_ENV === 'production'

if (isProduction && (!env.corsOrigin || env.corsOrigin === '*')) {
  throw new Error('CORS_ORIGIN must be set to a specific origin in production')
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 30 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
})

function createApp() {
  const app = express()

  // Trust fly.io proxy so rate limiter uses real client IP, not the shared fly.io edge IP
  app.set('trust proxy', 1)

  app.use(helmet())

  // Add version header
  app.use((req, res, next) => {
    res.setHeader('X-App-Version', version)
    next()
  })

  const corsOrigin = env.corsOrigin === '*' ? (isProduction ? false : true) : env.corsOrigin
  app.use(cors({ origin: corsOrigin }))
  app.use(express.json({ limit: '1mb' }))
  app.use(pinoHttp({ logger }))

  app.use(env.apiBasePath, apiLimiter)
  app.use(`${env.apiBasePath}/sessions/:id/join`, authLimiter)
  app.use(`${env.apiBasePath}/sessions/:id/leave`, authLimiter)

  const openapiPath = path.join(process.cwd(), 'docs/openapi.yaml')
  if (fs.existsSync(openapiPath)) {
    const doc = YAML.parse(fs.readFileSync(openapiPath, 'utf8'))
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(doc))
  }

  app.use(env.apiBasePath, v1Router)

  app.use(errorHandler)

  return app
}

module.exports = { createApp }
