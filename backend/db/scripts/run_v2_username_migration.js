const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { query } = require('../client');
const fs = require('fs');

const migrationFile = '170_add_username_update_limit.sql';

(async () => {
  try {
    console.log(`Running migration: ${migrationFile}`);
    const filePath = path.join(__dirname, '../schema', migrationFile);
    const sql = fs.readFileSync(filePath, 'utf8');
    await query(sql);
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
