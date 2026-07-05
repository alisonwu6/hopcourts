const cron = require('node-cron')
const { query } = require('../../lib/db')
const notificationsService = require('../notifications/notifications.service')
const log = require('../../lib/logger').child({ module: 'scheduler' })

async function notifyCheckinWindowOpening() {
  // One query: sessions whose check-in window just opened + their participants
  // LEFT JOIN notifications filters out anyone already notified for this session,
  // so a server restart within the 5-min window won't send duplicates.
  const { rows } = await query(`
    SELECT
      s.id          AS session_id,
      s.title,
      sp.user_id
    FROM public.sessions s
    JOIN public.session_participants sp ON sp.session_id = s.id
    LEFT JOIN public.notifications n
      ON  n.type             = 'checkin_open'
      AND n.entity_id        = s.id
      AND n.recipient_user_id = sp.user_id
    WHERE s.status = 'published'
      AND (s.starts_at - (s.checkin_open_mins_before * interval '1 minute'))
          BETWEEN NOW() - interval '5 minutes' AND NOW()
      AND n.id IS NULL
  `)

  for (const { session_id, title, user_id } of rows) {
    await notificationsService
      .createNotification({
        recipient_user_id: user_id,
        actor_user_id: null,
        type: 'checkin_open',
        entity_type: 'session',
        entity_id: session_id,
        title: 'Game On!',
        message: `"${title}" is starting soon — check in now.`,
        metadata: { deep_link: `/event/${session_id}` },
      })
      .catch((err) => log.error({ err }, 'checkin_open notify failed'))
  }
}

async function notifyTodayEvents() {
  // One query: sessions happening today + participants not yet notified today.
  // LEFT JOIN on (type, entity_id, recipient_user_id) deduplicates across restarts.
  const { rows } = await query(`
    SELECT
      s.id   AS session_id,
      s.title,
      sp.user_id
    FROM public.sessions s
    JOIN public.session_participants sp ON sp.session_id = s.id
    LEFT JOIN public.notifications n
      ON  n.type              = 'session_today'
      AND n.entity_id         = s.id
      AND n.recipient_user_id = sp.user_id
    WHERE s.status = 'published'
      AND DATE(s.starts_at AT TIME ZONE 'Australia/Sydney')
        = DATE(NOW()       AT TIME ZONE 'Australia/Sydney')
      AND n.id IS NULL
  `)

  for (const { session_id, title, user_id } of rows) {
    await notificationsService
      .createNotification({
        recipient_user_id: user_id,
        actor_user_id: null,
        type: 'session_today',
        entity_type: 'session',
        entity_id: session_id,
        title: "Your game is locked in today.",
        message: `"${title}" starts soon. See who's hopping in.`,
        metadata: { deep_link: `/event/${session_id}` },
      })
      .catch((err) => log.error({ err }, 'session_today notify failed'))
  }
}

const tasks = []

function startScheduler() {
  tasks.push(
    cron.schedule('*/5 * * * *', () => {
      notifyCheckinWindowOpening().catch((err) =>
        log.error({ err }, 'checkin window job failed')
      )
    }),
    cron.schedule('0 8 * * *', () => {
      notifyTodayEvents().catch((err) =>
        log.error({ err }, 'today events job failed')
      )
    }, { timezone: 'Australia/Sydney' })
  )

  log.info('scheduler started')
}

function stopScheduler() {
  tasks.forEach((t) => t.stop())
  tasks.length = 0
}

module.exports = { startScheduler, stopScheduler }
