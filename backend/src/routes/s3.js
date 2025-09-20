const express = require('express')
const multer = require('multer')
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { putAvatarMeta, getAvatarMeta } = require('../services/dynamo')

const router = express.Router()
const upload = multer()

const REGION = process.env.AWS_REGION || 'ap-southeast-2'
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'ssm-sportsmatch-media'

const s3 = new S3Client({ region: REGION })

// generate a presigned PUT URL for direct upload to S3
router.get('/avatar-upload-url', async (req, res) => {
  try {
    const { userId, ext = 'png', contentType = 'image/png' } = req.query
    if (!userId) return res.status(400).json({ error: 'Missing query param "userId"' })

    const safeExt = String(ext).toLowerCase()
    const key = `avatars/${userId}.${safeExt}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType
    })
    const url = await getSignedUrl(s3, command, { expiresIn: 600 }) // 10 minutes

    // record metadata in DynamoDB
    putAvatarMeta({ userId, key, contentType }).catch(err => {
      console.warn('DynamoDB putAvatarMeta failed:', err?.message || err)
    })

    return res.json({ url, key, contentType, expiresIn: 600 })
  } catch (err) {
    console.error('S3 presign PUT error:', err)
    return res.status(500).json({ error: err.message })
  }
})

// generate a presigned GET URL for downloading from S3 using query parameter
router.get('/avatar-url', async (req, res) => {
  try {
    const { key } = req.query
    if (!key)
      return res.status(400).json({ error: 'Missing query param "key"' })
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
    return res.json({ url, key, expiresIn: 3600 })
  } catch (err) {
    console.error('S3 presign (query) error:', err)
    return res.status(500).json({ error: err.message })
  }
})


// read avatar metadata from DynamoDB
// full path: /api/s3/debug/avatar-meta/:userId
router.get('/debug/avatar-meta/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const item = await getAvatarMeta(userId)
    if (!item) return res.status(404).json({ error: 'Not found' })
    return res.json(item)
  } catch (err) {
    console.error('DynamoDB getAvatarMeta error:', err)
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
