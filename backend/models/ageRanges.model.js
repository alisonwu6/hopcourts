const { query } = require('../src/lib/db')

async function listAgeRanges({ lang = 'zh', onlyActive = true } = {}) {
  const labelField = lang === 'en' ? 'label_en' : 'label_zh'
  const conditions = []
  if (onlyActive) conditions.push('is_active = true')
  const where = conditions.length ? `where ${conditions.join(' AND ')}` : ''
  const { rows } = await query(
    `select key, ${labelField} as label, sort, is_active from public.age_ranges ${where} order by sort asc`
  )
  return rows
}

module.exports = { listAgeRanges }
