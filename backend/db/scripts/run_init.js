const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { query } = require('../client');
const fs = require('fs');

const schemaDir = path.join(__dirname, '../schema');

const files = [
  '001_initial_schema.sql',
  '002_seed_data.sql',
  '003_storage_and_policies.sql'
];

const dropAllSql = `
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Also drop types if needed, but for now tables are main focus. 
    -- Extensions are usually kept.
END $$;
`;

(async () => {
  try {
    console.log('🚧 Starting Database Initialization...');

    // 1. Drop All Tables
    console.log('🔥 Dropping all existing tables...');
    await query(dropAllSql);
    console.log('✅ Tables dropped.');

    // 2. Run Schema & Seeds
    for (const file of files) {
      console.log(`📂 Processing: ${file}`);
      const filePath = path.join(schemaDir, file);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      await query(sql);
      console.log(`✅ Completed: ${file}`);
    }

    console.log('🎉 Database initialized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Initialization Failed:', err);
    process.exit(1);
  }
})();
