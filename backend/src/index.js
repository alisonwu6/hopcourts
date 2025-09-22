const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const mysql = require('mysql2/promise')
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

// Connect to MySQL
async function startServer() {
  try {
    await waitForDB()

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server port:${PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err.message)
    process.exit(1)
  }
}

startServer()
