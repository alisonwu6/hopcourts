const { query } = require('../db/client')

async function listCities({ country, lang = 'zh', onlyActive = true } = {}) {
  const labelField = lang === 'en' ? 'name_en' : 'name_zh'
  const conditions = []
  const params = []
  let idx = 0
  if (country) {
    params.push(country)
    conditions.push(`country_key = $${++idx}`)
  }
  if (onlyActive) conditions.push('is_active = true')
  const where = conditions.length ? `where ${conditions.join(' AND ')}` : ''
  const { rows } = await query(
    `select key, country_key, ${labelField} as label, sort, is_active from public.cities ${where} order by sort asc`,
    params
  )
  return rows
}

module.exports = { listCities }
