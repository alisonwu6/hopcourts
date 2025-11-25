const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

function loadEnv() {
  const env = process.env.NODE_ENV || 'development'
  const rootDir = path.resolve(__dirname, '../..')

  const candidates = [path.join(rootDir, '.env')]

  if (env === 'production') {
    candidates.push(path.join(rootDir, '.env.production'))
  } else {
    candidates.push(path.join(rootDir, '.env.local'))
  }

  candidates.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath, override: true })
    }
  })
}

module.exports = loadEnv
