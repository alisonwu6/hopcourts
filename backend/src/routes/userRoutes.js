const express = require('express')
const router = express.Router()
const {
  handleGetMe,
  handleCreateUser,
  handleGetUserAvatar,
} = require('../controllers/userController')
const uploadImage = require('../middleware/uploadImage')
const verifyToken = require('../middleware/verifyToken')

router.post('/', uploadImage.single('avatar'), handleCreateUser)
router.get('/:userId/avatar', handleGetUserAvatar)
router.get('/me', verifyToken, handleGetMe)

module.exports = router