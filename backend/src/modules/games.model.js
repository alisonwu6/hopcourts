// backend/src/modules/games/games.model.js
const supabase = require('../../clients/supabaseClient')

async function findAllGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('start_datetime', { ascending: true })

  if (error) {
    throw new Error(`DB Error: ${error.message}`)
  }

  return data
}

module.exports = {
  findAllGames,
}
