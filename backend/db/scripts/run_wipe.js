const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { query } = require('../client');
const fs = require('fs');

const wipeScript = fs.readFileSync(path.join(__dirname, 'wipe_all_data.sql'), 'utf8');

(async () => {
  try {
    console.log('Wiping all data from public schema...');
    await query(wipeScript);
    console.log('Wipe successful! All public tables truncated.');
    process.exit(0);
  } catch (err) {
    console.error('Wipe failed:', err);
    process.exit(1);
  }
})();
