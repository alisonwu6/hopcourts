const express = require('express')
const { verifyToken } = require('../../middleware/verifyToken')
const { saveSubscription, deleteSubscription } = require('../../modules/push/push.service')

const router = express.Router()

router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
})

router.post('/subscribe', verifyToken, async (req, res) => {
  try {
    await saveSubscription(req.user.id, req.body)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/subscribe', verifyToken, async (req, res) => {
  try {
    await deleteSubscription(req.user.id, req.body.endpoint)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = { pushRouter: router }
