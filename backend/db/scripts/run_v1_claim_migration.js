const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { query } = require('../client');
const fs = require('fs');

const migrationScript = fs.readFileSync(path.join(__dirname, '../schema/131_venue_claim_v1_setup.sql'), 'utf8');

(async () => {
  try {
    console.log('Running consolidated Venue Claim Flow migration...');
    await query(migrationScript);
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
