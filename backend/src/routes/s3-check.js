const express = require('express')
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3')
require('dotenv').config()

const router = express.Router()

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
})

router.get('/check-s3-permission', async (req, res) => {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME,
    MaxKeys: 1,
  })

  try {
    const data = await s3.send(command)
    res.json({ message: 'Permission OK', objects: data.Contents })
  } catch (err) {
    console.error('Permission error:', err)
    res.status(403).json({
      error: 'No permission or invalid credentials',
      details: err.message,
    })
  }
})

module.exports = router
