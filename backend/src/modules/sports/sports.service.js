const { supabaseAdmin } = require('../../lib/supabaseAdmin')
const { pgPool, hasPgConfig } = require('../../lib/pgClient')
const { Errors } = require('../../lib/errors')

async function listSports({ lang = 'zh' }) {
  const labelField = lang === 'en' ? 'label_en' : 'label_zh'

  let items = []
  if (hasPgConfig && pgPool) {
    const result = await pgPool.query(
      `select key, ${labelField} as label, category, icon, sort, is_active
       from public.sports
       where is_active = true
       order by sort asc`
    )
    items = result.rows.map((row) => ({
      key: row.key,
      label: row.label,
      category: row.category,
      icon: row.icon,
      order: row.sort,
      is_active: row.is_active,
    }))
  } else if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('sports')
      .select(`key, ${labelField}, sort, is_active, category, icon`)
      .eq('is_active', true)
      .order('sort', { ascending: true })

    if (error) {
      throw Errors.internal('Failed to fetch sports', { supabase: error.message })
    }

    items = (data || []).map((row) => ({
      key: row.key,
      label: row[labelField],
      category: row.category,
      icon: row.icon,
      order: row.sort,
      is_active: row.is_active,
    }))
  } else {
    throw Errors.internal('No database configured for sports lookup')
  }

  return { items }
}

module.exports = { listSports }
