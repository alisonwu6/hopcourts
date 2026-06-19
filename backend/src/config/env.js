const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// Only load dotenv in non-production environments
if (process.env.NODE_ENV !== 'production') {
  const envFiles = ['.env.local', '.env']
  envFiles.forEach((filename) => {
    const filePath = path.join(process.cwd(), filename)
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath })
    }
  })
}

function parseCorsOrigin(raw) {
  if (!raw) return '*'
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean)
  if (list.length === 0) return '*'
  if (list.length === 1) return list[0]
  return list
}

const env = {
  port: Number(process.env.PORT || 3000),
  apiBasePath: process.env.API_BASE_PATH || '/api/v1',
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  pg: {
    host: process.env.PGHOST || '',
    port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
    database: process.env.PGDATABASE || '',
    user: process.env.PGUSER || '',
    password: process.env.PGPASSWORD || '',
    sslmode: process.env.PGSSLMODE || '',
  },
}

module.exports = { env }
