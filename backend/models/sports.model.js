const { query } = require('../db/client')

function buildLocaleColumn(locale = 'zh') {
  return locale === 'en' ? 'label_en' : 'label_zh'
}

async function listSports({ locale = 'zh', q, limit = 50, offset = 0 } = {}) {
  const labelCol = buildLocaleColumn(locale)
  const conditions = []
  const params = []

  if (q) {
    params.push(`%${q}%`, `%${q}%`)
    conditions.push(`(${labelCol} ILIKE $${params.length - 1} OR label_en ILIKE $${params.length})`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const sql = `
    select key, ${labelCol} as label, label_en, label_zh, category, icon, sort, is_active
    from public.sports
    where is_active = true
    ${conditions.length ? `AND ${conditions.join(' AND ')}` : ''}
    order by sort asc
    limit $${params.length + 1}
    offset $${params.length + 2}
  `
  params.push(limit, offset)

  const { rows } = await query(sql, params)
  return rows
}

async function getSportByKey(key) {
  const { rows } = await query(
    'select key, label_en, label_zh, category, icon, sort, is_active from public.sports where key = $1',
    [key]
  )
  return rows[0] || null
}

async function listSportsByKeys(keys = []) {
  if (!keys.length) return []
  const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(',')
  const { rows } = await query(
    `select key, label_en, label_zh, category, icon, sort, is_active
     from public.sports
     where key in (${placeholders})
     order by sort asc`,
    keys
  )
  return rows
}

module.exports = {
  listSports,
  getSportByKey,
  listSportsByKeys,
}
