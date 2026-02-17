const { query } = require('../src/lib/db')

async function listCountries({ lang = 'zh', onlyActive = true } = {}) {
  const labelField = lang === 'en' ? 'name_en' : 'name_zh'
  const conditions = []
  if (onlyActive) conditions.push('is_active = true')
  const where = conditions.length ? `where ${conditions.join(' AND ')}` : ''
  const { rows } = await query(
    `select key, ${labelField} as label, sort, is_active from public.countries ${where} order by sort asc`
  )
  return rows
}

module.exports = { listCountries }
