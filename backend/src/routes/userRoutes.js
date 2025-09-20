const express = require('express')
const router = express.Router()
const {
  handleCreateUser,
  handleGetUserAvatar,
} = require('../controllers/userController')
const uploadImage = require('../middleware/uploadImage')

router.post('/', uploadImage.single('avatar'), handleCreateUser)
router.get('/:userId/avatar', handleGetUserAvatar)

module.exports = router