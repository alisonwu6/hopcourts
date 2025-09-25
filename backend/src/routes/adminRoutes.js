const express = require('express')
const auth = require('../middleware/auth')
const { requireGroup } = require('../middleware/auth')
const router = express.Router()

router.get('/', auth, requireGroup('Admin'), (req, res) => {
  res.json({
    message: 'Welcome Admin',
    user: { username: req.user.username, groups: req.user.groups },
  })
})

module.exports = router
