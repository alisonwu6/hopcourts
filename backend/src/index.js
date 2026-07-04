const { createApp } = require('./app')
const { startScheduler, stopScheduler } = require('./modules/scheduler/scheduler.service')
const { getPool } = require('./lib/db')

const app = createApp()
const port = Number(process.env.PORT) || 8080

const server = app.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://0.0.0.0:${port}${process.env.API_BASE_PATH || ''}`)
  startScheduler()
})

function gracefulShutdown(signal) {
  console.log(`${signal} received — shutting down gracefully`)

  // Force exit if shutdown takes too long
  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out — forcing exit')
    process.exit(1)
  }, 10_000)
  forceExit.unref()

  server.close(async () => {
    try {
      stopScheduler()
      const pool = getPool()
      await pool.end()
      console.log('Shutdown complete')
      process.exit(0)
    } catch (err) {
      console.error('Error during shutdown:', err)
      process.exit(1)
    }
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
