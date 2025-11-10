const express = require('express')
const supabase = require('../utils/supabase')

const router = express.Router()

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'avatars'
const UPLOAD_URL_TTL = Number(process.env.SUPABASE_UPLOAD_URL_TTL || 600)
const DOWNLOAD_URL_TTL = Number(process.env.SUPABASE_DOWNLOAD_URL_TTL || 3600)

function ensureSupabase(res) {
  if (supabase) return true
  res
    .status(500)
    .json({ error: 'Supabase credentials are not configured on the API' })
  return false
}

function sanitizeExtension(ext) {
  const cleaned = String(ext || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return cleaned || 'png'
}

router.get('/avatar-upload-url', async (req, res) => {
  if (!ensureSupabase(res)) return

  try {
    const { userId, ext = 'png', contentType = 'image/png' } = req.query
    if (!userId) {
      return res.status(400).json({ error: 'Missing query param "userId"' })
    }

    const fileExt = sanitizeExtension(ext)
    const path = `avatars/${userId}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(path, UPLOAD_URL_TTL)

    if (error) {
      console.error('[storage] createSignedUploadUrl error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.json({
      bucket: STORAGE_BUCKET,
      key: data?.path || path,
      url: data?.signedUrl,
      token: data?.token,
      expiresIn: UPLOAD_URL_TTL,
      contentType,
    })
  } catch (err) {
    console.error('[storage] avatar-upload-url error:', err)
    return res.status(500).json({ error: err.message })
  }
})

router.get('/avatar-url', async (req, res) => {
  if (!ensureSupabase(res)) return

  try {
    const key = req.query.key || req.query.path
    if (!key) {
      return res.status(400).json({ error: 'Missing query param "key"' })
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(key, DOWNLOAD_URL_TTL)

    if (error) {
      console.error('[storage] createSignedUrl error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.json({
      bucket: STORAGE_BUCKET,
      key,
      url: data?.signedUrl,
      expiresIn: DOWNLOAD_URL_TTL,
    })
  } catch (err) {
    console.error('[storage] avatar-url error:', err)
    return res.status(500).json({ error: err.message })
  }
})

module.exports = router
