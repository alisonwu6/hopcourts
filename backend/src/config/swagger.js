const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

// Reads the single source of truth (docs/manual/openapi.yaml) and parses it.
function loadSpec() {
  const specPath = path.join(process.cwd(), 'docs/manual/openapi.yaml')
  try {
    const file = fs.readFileSync(specPath, 'utf8')
    return yaml.parse(file)
  } catch (error) {
    console.error('[swagger] Failed to load OpenAPI spec:', error.message)
    return {
      openapi: '3.0.3',
      info: { title: 'SportsMatch API', version: '1.0.0' },
      paths: {},
    }
  }
}

module.exports = loadSpec()
