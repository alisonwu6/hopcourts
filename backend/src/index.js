const loadEnv = require('./config/loadEnv')
loadEnv()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const waitForDB = require('./utils/db')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const app = express()
const PORT = process.env.PORT || 3000
console.log('[PG CONFIG]', {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  sslmode: process.env.PGSSLMODE,
})

const userRoutes = require('./routes/userRoutes')
const gameRoutes = require('./routes/gameRoutes')
const gameJoinRoutes = require('./routes/gameJoinRoutes')
const messageRoutes = require('./routes/messageRoutes')
const onboardingRoutes = require('./routes/onboardingRoutes')
const venueRoutes = require('./routes/venueRoutes')
const storageRoutes = require('./routes/storageRoutes')
const sportsRoutes = require('./routes/sportsRoutes')
// Middleware
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/storage', storageRoutes)
app.use('/api/s3', storageRoutes)
app.use('/uploads', express.static('src/uploads')) // serve 圖片
app.use('/api/users', userRoutes)
app.use('/api', gameRoutes)
app.use('/api', gameJoinRoutes)
app.use('/api', messageRoutes)
app.use('/api/onboarding', onboardingRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api', sportsRoutes)

// Try to connect to the DB in the background so the container can pass ALB health checks
async function connectDBWithRetry(maxRetry = 30, interval = 2000) {
  for (let i = 1; i <= maxRetry; i++) {
    try {
      await waitForDB()
      console.log('✅ Database connected')
      return
    } catch (err) {
      console.warn(`DB not ready (attempt ${i}/${maxRetry}): ${err.message}`)
      await new Promise((r) => setTimeout(r, interval))
    }
  }
  console.error('⚠️ Could not connect to DB after retries — continuing anyway')
}

// Start HTTP server immediately; DB connects in the background
function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`)
  })
  // Kick off DB connection attempts without blocking startup
  connectDBWithRetry()
}

startServer()
