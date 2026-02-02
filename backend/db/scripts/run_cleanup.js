const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { query } = require('../client');
const fs = require('fs');

const cleanupScript = fs.readFileSync(path.join(__dirname, 'cleanup_venues.sql'), 'utf8');

(async () => {
  try {
    console.log('Running cleanup script...');
    await query(cleanupScript);
    console.log('Cleanup successful!');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
})();
