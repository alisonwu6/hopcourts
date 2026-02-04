const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { query } = require('../db/client');
const fs = require('fs');

async function run() {
  console.log('Running migration 190_create_feedback.sql ...');
  try {
    const sqlPath = path.join(__dirname, '../db/schema/190_create_feedback.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await query(sql);
    console.log('Migration 190 executed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
