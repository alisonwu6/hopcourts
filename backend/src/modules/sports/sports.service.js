const { listSports: listSportsModel } = require('../../../models/sports.model')
const { Errors } = require('../../lib/errors')

async function listSports({ lang = 'zh' }) {
  const rows = await listSportsModel({ locale: lang })
  if (!rows) throw Errors.internal('Failed to fetch sports')

  const items = rows.map((row) => ({
    key: row.key,
    label: row.label,
    category: row.category,
    icon: row.icon,
    order: row.sort,
    is_active: row.is_active,
  }))

  return { items }
}

module.exports = { listSports }
