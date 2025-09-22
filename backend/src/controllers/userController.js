const { createUser } = require('../models/userModel')
const { GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { getAvatarMeta } = require('../services/dynamo')
const { S3Client } = require('@aws-sdk/client-s3')

const REGION = process.env.AWS_REGION || 'ap-southeast-2'
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'ssm-sportsmatch-media'
const s3 = new S3Client({ region: REGION })

const handleCreateUser = async (req, res) => {
  try {
    const { username, firstname, lastname, email, role, password } = req.body

    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    if (!firstname) {
      return res.status(400).json({ error: 'Firstname is required' })
    }

    if (!lastname) {
      return res.status(400).json({ error: 'Lastname is required' })
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    const avatarPath = req.file ? `/uploads/${req.file.filename}` : null
    const userId = await createUser(
      username,
      firstname,
      lastname,
      email,
      password,
      avatarPath,
      role
    )

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        username,
        firstname,
        lastname,
        email,
        avatar: avatarPath,
        role,
      },
    })
  } catch (err) {
    console.error('Failed to create user:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const handleGetUserAvatar = async (req, res) => {
  try {
    const { userId } = req.params
    const meta = await getAvatarMeta(userId)

    if (!meta) {
      // 沒有上傳過 → 回傳預設頭像
      return res.json({ url: '/uploads/default.png' })
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: meta.s3Key,
    })
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })

    return res.json({ url })
  } catch (err) {
    console.error('Avatar fetch error:', err)
    return res.status(500).json({ error: err.message })
  }
}

const handleGetMe = async (req, res) => {
  return res.json({ ok: true, user: req.user })
}

module.exports = {
  handleCreateUser,
  handleGetUserAvatar,
  handleGetMe,
}
