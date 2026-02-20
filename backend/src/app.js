const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express')
const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const { version } = require('../package.json')
const { env } = require('./config/env')
const { v1Router } = require('./routes/v1')
const { errorHandler } = require('./middleware/errorHandler')

function createApp() {
  const app = express()

  // Add version header
  app.use((req, res, next) => {
    res.setHeader('X-App-Version', version)
    next()
  })

  app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }))
  app.use(express.json({ limit: '1mb' }))
  app.use(morgan('dev'))

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
