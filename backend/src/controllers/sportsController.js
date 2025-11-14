const sports = require('../data/sports')

async function listSports(_req, res) {
  res.json({ data: sports })
}

module.exports = {
  listSports,
}
