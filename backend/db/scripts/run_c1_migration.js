const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') })
const { query } = require('../client')
const fs = require('fs')

async function runMigration() {
  try {
    console.log('Starting C1 Venue Portal migration...')
    
    const sqlPath = path.join(__dirname, '../schema/150_c1_venue_portal_setup.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    await query(sql)
    
    console.log('✅ C1 Migration completed successfully.')
    process.exit(0)
  } catch (err) {
    console.error('❌ Migration failed:', err)
    process.exit(1)
  }
}

runMigration()
