const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const waitForDB = require('./utils/db')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const videoRoutes = require('./routes/videoRoutes')
const cpuRoutes = require('./routes/cpuRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const gameRoutes = require('./routes/gameRoutes')
const adminRoutes = require('./routes/adminRoutes')
const s3Routes = require('./routes/s3')
const s3CheckRoutes = require('./routes/s3-check')
app.use('/api/s3-check', s3CheckRoutes)
// Middleware
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/s3', s3Routes)
app.use('/api/video', videoRoutes)
app.use('/api', cpuRoutes)
app.use('/uploads', express.static('src/uploads')) // serve 圖片
app.use('/api/admin', adminRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/games', gameRoutes)

// Test route
app.get('/api/health', (req, res) => {
  res.json({ message: 'health is good' })
})

// Debug-only: quick ping to verify Redis is alive (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  app.get('/debug/redis-ping', async (req, res) => {
    try {
      const { redis } = require('./cache')
      const pong = await redis.ping()
      res.json({ pong })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}

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
