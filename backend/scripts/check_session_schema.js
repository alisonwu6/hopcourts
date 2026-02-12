/*
 * Usage: node scripts/check_session_schema.js
 *
 * This checks if DB columns (from 001_initial_schema.sql)
 * are aligned with OpenAPI schema properties (openapi.yaml).
 *
 * Tables Checked:
 * - sessions -> Session
 * - users -> User
 * - venues -> Venue
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const SCHEMA_SQL_PATH = path.join(__dirname, '../db/schema/001_initial_schema.sql');
const OPENAPI_YAML_PATH = path.join(__dirname, '../docs/openapi.yaml');

// Tables to check mapping: [DB Table Name] -> [OpenAPI Schema Name]
const CHECKS = [
  { table: 'sessions', schema: 'Session' },
  { table: 'users', schema: 'User' },
  { table: 'venues', schema: 'Venue' }
];

// Special mappings (DB Col -> API Prop)
const GLOBAL_MAPPING = {
  'notes': 'description', // sessions.notes -> Session.description
  'name_display': 'name_display', // venues.name_display -> Venue.name_display (Explicit ok)
  // Add more mappings if needed
  // 'created_at': 'createdAt' // Example if camelCase
};

function getDbColumns(tableName) {
  const content = fs.readFileSync(SCHEMA_SQL_PATH, 'utf8');
  const normalized = content.replace(/\r\n/g, '\n');
  
  // Find "CREATE TABLE tableName ("
  const searchStr = `CREATE TABLE ${tableName} (`;
  const tableStart = normalized.indexOf(searchStr);
  
  if (tableStart === -1) {
    console.warn(`⚠️ Warning: Could not find table "${tableName}" in SQL.`);
    return [];
  }
  
  const afterStart = normalized.substring(tableStart);
  // Find matching closing parenthesis );
  // Simple heuristic: split by lines and look for );
  const lines = afterStart.split('\n');
  const cols = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith(');')) break; // End of table
    if (!line || line.startsWith('--')) continue; // Comment/Empty
    
    // Extract first word
    const parts = line.split(/\s+/);
    let colName = parts[0];
    colName = colName.replace(/"/g, ''); // Remove quotes
    
    // Ignore keywords definitions
    const keywords = ['CONSTRAINT', 'PRIMARY', 'FOREIGN', 'CHECK', 'UNIQUE', 'INDEX'];
    if (keywords.includes(colName.toUpperCase())) continue;
    
    cols.push(colName);
  }
  
  return cols;
}

function getOpenApiProperties(schemaName) {
  const content = fs.readFileSync(OPENAPI_YAML_PATH, 'utf8');
  const doc = yaml.parse(content);
  
  if (!doc.components?.schemas?.[schemaName]) {
    console.warn(`⚠️ Warning: Could not find schema "${schemaName}" in OpenAPI.`);
    return [];
  }
  
  return Object.keys(doc.components.schemas[schemaName].properties || {});
}

function run() {
  console.log('🔍 Checking Schema Alignment...\n');
  let hasError = false;

  CHECKS.forEach(({ table, schema }) => {
    console.log(`Checking [${table}] vs [${schema}]...`);
    const dbCols = getDbColumns(table);
    const apiProps = getOpenApiProperties(schema);
    
    if (dbCols.length === 0 || apiProps.length === 0) {
      console.log('   Skipping due to missing definition.\n');
      return;
    }

    const missingInApi = dbCols.filter(c => {
      if (apiProps.includes(c)) return false;
      if (GLOBAL_MAPPING[c] && apiProps.includes(GLOBAL_MAPPING[c])) return false;
      // Also check specific table mappings if any...
      return true;
    });

    const missingInDb = apiProps.filter(p => {
      if (dbCols.includes(p)) return false;
      const dbSource = Object.keys(GLOBAL_MAPPING).find(k => GLOBAL_MAPPING[k] === p);
      if (dbSource && dbCols.includes(dbSource)) return false;
      return true;
    });

    if (missingInApi.length === 0 && missingInDb.length === 0) {
      console.log('   ✅ Match perfectly!');
    } else {
      hasError = true;
      if (missingInApi.length > 0) {
        console.error('   ❌ Missing into OpenAPI (DB has):', missingInApi.join(', '));
      }
      if (missingInDb.length > 0) {
        console.error('   ❌ Missing into DB (OpenAPI has):', missingInDb.join(', '));
      }
    }
    console.log(''); // New line
  });

  if (hasError) {
    console.error('🚨 Validation Failed with errors above.');
    process.exit(1);
  } else {
    console.log('✨ All checks passed!');
  }
}

run();
