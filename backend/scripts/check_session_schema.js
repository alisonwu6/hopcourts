/*
 * Usage: node scripts/check_session_schema.js
 *
 * Contract-driven schema validation:
 * - DB table columns (from migration SQL) vs OpenAPI schema properties
 * - Coverage gate: OpenAPI schemas must be either contracted or explicitly allowed
 */

const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

const CONTRACTS_PATH = path.join(__dirname, './schema_contracts.json')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function readOpenApiDoc(filePath) {
  return yaml.parse(fs.readFileSync(filePath, 'utf8'))
}

function getDbColumns(sqlContent, tableName) {
  const normalized = sqlContent.replace(/\r\n/g, '\n')
  const searchStr = `CREATE TABLE ${tableName} (`
  const tableStart = normalized.indexOf(searchStr)

  if (tableStart === -1) {
    return []
  }

  const afterStart = normalized.substring(tableStart)
  const lines = afterStart.split('\n')
  const cols = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith(');')) break
    if (!line || line.startsWith('--')) continue

    const parts = line.split(/\s+/)
    let colName = parts[0]
    colName = colName.replace(/"/g, '')

    const keywords = ['CONSTRAINT', 'PRIMARY', 'FOREIGN', 'CHECK', 'UNIQUE', 'INDEX']
    if (keywords.includes(colName.toUpperCase())) continue

    cols.push(colName)
  }

  return cols
}

function validateContractsConfig(contractsConfig, openApiSchemas) {
  const errors = []
  const contracts = contractsConfig.contracts || []
  const allowUnmappedSchemas = new Set(contractsConfig.allowUnmappedSchemas || [])

  const contractSchemaSet = new Set()
  const contractTableSet = new Set()

  for (const contract of contracts) {
    if (!contract.table || !contract.schema) {
      errors.push(`Invalid contract entry: ${JSON.stringify(contract)}`)
      continue
    }
    if (contractSchemaSet.has(contract.schema)) {
      errors.push(`Duplicate schema contract: ${contract.schema}`)
    }
    if (contractTableSet.has(contract.table)) {
      errors.push(`Duplicate table contract: ${contract.table}`)
    }
    contractSchemaSet.add(contract.schema)
    contractTableSet.add(contract.table)
  }

  for (const schema of contractSchemaSet) {
    if (!openApiSchemas.has(schema)) {
      errors.push(`Contract schema not found in OpenAPI: ${schema}`)
    }
  }

  for (const schema of allowUnmappedSchemas) {
    if (!openApiSchemas.has(schema)) {
      errors.push(`allowUnmappedSchemas entry not found in OpenAPI: ${schema}`)
    }
  }

  const uncoveredSchemas = [...openApiSchemas].filter(
    (schema) => !contractSchemaSet.has(schema) && !allowUnmappedSchemas.has(schema)
  )

  if (uncoveredSchemas.length > 0) {
    errors.push(`Uncovered OpenAPI schemas (add contract or allowlist): ${uncoveredSchemas.join(', ')}`)
  }

  return errors
}

function run() {
  const contractsConfig = readJson(CONTRACTS_PATH)
  const schemaSqlPath = path.join(__dirname, contractsConfig.schemaSqlPath)
  const openApiPath = path.join(__dirname, contractsConfig.openApiPath)
  const globalMappings = contractsConfig.globalMappings || {}
  const contracts = contractsConfig.contracts || []

  const sqlContent = fs.readFileSync(schemaSqlPath, 'utf8')
  const openApiDoc = readOpenApiDoc(openApiPath)
  const openApiSchemas = new Set(Object.keys(openApiDoc.components?.schemas || {}))

  console.log('🔍 Checking Schema Alignment...\n')

  const configErrors = validateContractsConfig(contractsConfig, openApiSchemas)
  if (configErrors.length > 0) {
    for (const error of configErrors) {
      console.error(`❌ ${error}`)
    }
    console.error('\n🚨 Validation Failed (contract configuration errors).')
    process.exit(1)
  }

  let hasError = false

  for (const contract of contracts) {
    const { table, schema, ignoreDbColumns = [], virtualApiProps = [] } = contract
    console.log(`Checking [${table}] vs [${schema}]...`)

    const dbCols = getDbColumns(sqlContent, table)
    const apiProps = Object.keys(openApiDoc.components.schemas[schema].properties || {})
    const ignoreDb = new Set(ignoreDbColumns)
    const virtualApi = new Set(virtualApiProps)

    if (dbCols.length === 0) {
      hasError = true
      console.error(`   ❌ Table not found in SQL: ${table}`)
      console.log('')
      continue
    }

    const missingInApi = dbCols.filter((col) => {
      if (ignoreDb.has(col)) return false
      if (apiProps.includes(col)) return false
      if (globalMappings[col] && apiProps.includes(globalMappings[col])) return false
      return true
    })

    const missingInDb = apiProps.filter((prop) => {
      if (virtualApi.has(prop)) return false
      if (dbCols.includes(prop)) return false
      const mappedDbColumn = Object.keys(globalMappings).find((dbCol) => globalMappings[dbCol] === prop)
      if (mappedDbColumn && dbCols.includes(mappedDbColumn)) return false
      return true
    })

    if (missingInApi.length === 0 && missingInDb.length === 0) {
      console.log('   ✅ Match perfectly!')
    } else {
      hasError = true
      if (missingInApi.length > 0) {
        console.error(`   ❌ Missing into OpenAPI (DB has): ${missingInApi.join(', ')}`)
      }
      if (missingInDb.length > 0) {
        console.error(`   ❌ Missing into DB (OpenAPI has): ${missingInDb.join(', ')}`)
      }
    }

    console.log('')
  }

  if (hasError) {
    console.error('🚨 Validation Failed with errors above.')
    process.exit(1)
  }

  console.log('✨ All checks passed!')
}

run()
