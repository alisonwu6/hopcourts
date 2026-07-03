const express = require('express')
const { verifyToken } = require('../../middleware/verifyToken')
const { saveSubscription, deleteSubscription, sendPushToUser } = require('../../modules/push/push.service')

const router = express.Router()

router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
})

router.post('/subscribe', verifyToken, async (req, res, next) => {
  try {
    const isNew = await saveSubscription(req.user.id, req.body)
    res.json({ ok: true })
    if (isNew) {
      sendPushToUser(req.user.id, {
        title: "Mate, you're in.",
        body: "We'll buzz you when games start, players join, or it's time to check in.",
      }).catch(() => {})
    }
  } catch (err) {
    next(err)
  }
})

router.delete('/subscribe', verifyToken, async (req, res, next) => {
  try {
    await deleteSubscription(req.user.id, req.body.endpoint)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = { pushRouter: router }
