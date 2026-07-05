const { createApp } = require('./app')
const { startScheduler, stopScheduler } = require('./modules/scheduler/scheduler.service')
const { getPool } = require('./lib/db')
const logger = require('./lib/logger')

const app = createApp()
const port = Number(process.env.PORT) || 8080

const server = app.listen(port, '0.0.0.0', () => {
  logger.info({ port }, 'API listening')
  startScheduler()
})

function gracefulShutdown(signal) {
  logger.info({ signal }, 'graceful shutdown initiated')

  const forceExit = setTimeout(() => {
    logger.error('graceful shutdown timed out — forcing exit')
    process.exit(1)
  }, 10_000)
  forceExit.unref()

  server.close(async () => {
    try {
      stopScheduler()
      const pool = getPool()
      await pool.end()
      logger.info('shutdown complete')
      process.exit(0)
    } catch (err) {
      logger.error({ err }, 'error during shutdown')
      process.exit(1)
    }
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
