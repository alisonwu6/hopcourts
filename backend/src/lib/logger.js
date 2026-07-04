const pino = require('pino')

const isDev = process.env.NODE_ENV !== 'production'
const logtailToken = process.env.LOGTAIL_TOKEN

const targets = []

if (isDev) {
  targets.push({
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
    level: 'trace',
  })
} else {
  targets.push({
    target: 'pino/file',
    options: { destination: 1 },
    level: 'info',
  })
}

if (logtailToken) {
  targets.push({
    target: '@logtail/pino',
    options: { sourceToken: logtailToken },
    level: 'info',
  })
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { targets },
})

module.exports = logger
