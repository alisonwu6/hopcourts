const webpush = require('web-push')
const { supabaseAdmin } = require('../../lib/supabase')

webpush.setVapidDetails(
  'mailto:alison.wu23@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

async function saveSubscription(userId, subscription) {
  const { endpoint, keys } = subscription
  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .upsert(
      { user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { onConflict: 'user_id,endpoint' }
    )
  if (error) throw error
}

async function deleteSubscription(userId, endpoint) {
  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
  if (error) throw error
}

async function sendPushToUser(userId, payload) {
  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (error || !subs?.length) return

  const message = JSON.stringify(payload)
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        message
      ).catch(async (err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
        throw err
      })
    )
  )
  return results
}

module.exports = { saveSubscription, deleteSubscription, sendPushToUser }
