const { query } = require('../db/client')

async function run() {
  console.log('Updating Taiwan main island cities to active...')
  try {
    const res = await query(`
      UPDATE public.cities
      SET is_active = true
      WHERE country_key = 'TW'
      AND key NOT IN ('PEN', 'KIN', 'LIE');
    `)
    console.log(`Updated ${res.rowCount} cities.`)
  } catch (err) {
    console.error('Failed to update cities:', err)
  } finally {
    process.exit(0)
  }
}

run()
