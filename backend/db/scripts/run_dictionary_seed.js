const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { query } = require('../client');
const fs = require('fs');

const seedFiles = [
  '100_seed_sports.sql',
  '130_seed_countries.sql',
  '140_seed_cities.sql',
  '150_seed_vibes.sql',
  '160_seed_age_ranges.sql'
];

(async () => {
  try {
    console.log('Starting dictionary seeding...');
    
    for (const file of seedFiles) {
      console.log(`Running seed: ${file}`);
      const filePath = path.join(__dirname, '../seed', file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Remove psql-specific commands if any (like \set, \echo, \ir)
      // The current individual seed files look like pure SQL based on my previous view_file calls.
      await query(sql);
    }
    
    console.log('Dictionary seeding successful!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();
