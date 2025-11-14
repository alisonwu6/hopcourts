const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

const SPEC_PATH = path.join(__dirname, '../../api/openapi.yaml')

function loadSpec() {
  try {
    const file = fs.readFileSync(SPEC_PATH, 'utf8')
    return yaml.parse(file)
  } catch (error) {
    console.error('[swagger] Failed to load OpenAPI spec:', error.message)
    return {
      openapi: '3.0.0',
      info: {
        title: 'SportsMatch API',
        version: '1.0.0',
        description: 'Fallback spec because api/openapi.yaml was unavailable.',
      },
    }
  }
}

module.exports = loadSpec()
