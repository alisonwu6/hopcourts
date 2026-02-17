const path = require('path')

// For local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

  // Fix for running script from host machine (outside docker)
  if (process.env.PGHOST === 'host.docker.internal') {
    process.env.PGHOST = 'localhost'
  }
}

const { query } = require('../src/lib/db')
// Use require(path) to load service
// But service requires model, model requires src/lib/db.
// Need to make sure paths inside service/model resolve correctly.
// Relative imports in modules define their own context so it is fine.

const notificationsService = require('../src/modules/notifications/notifications.service')

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.log('Usage: node scripts/send_announcement.js "<Title>" "<Message>"')
    console.log('Example: node scripts/send_announcement.js "系統公告" "本週六停機維護"')
    process.exit(1)
  }

  const title = args[0]
  const message = args[1]
  
  console.log(`[Announce] Title: ${title}`)
  console.log(`[Announce] Message: ${message}`)
  
  try {
    // 1. Fetch all users
    const { rows: users } = await query('SELECT id FROM public.users')
    console.log(`Target Users: ${users.length}`)
    
    if (users.length === 0) {
        console.log('No users found.')
        process.exit(0)
    }

    // 2. Send Notifications
    let count = 0
    console.log('Sending...')
    // Use Promise.all for speed? Or sequential to be nice to DB?
    // Sequential for script is fine.
    
    const BATCH_SIZE = 50
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE)
        await Promise.all(batch.map(user => 
             notificationsService.createNotification({
                recipient_user_id: user.id,
                actor_user_id: null,
                type: 'official_announcement',
                entity_type: 'announcement',
                entity_id: null,
                title: title,
                message: message,
                metadata: {} 
            })
        ))
        count += batch.length
        process.stdout.write(`\rSent: ${count}/${users.length}`)
    }

    console.log(`\nSuccess! Sent to ${count} users.`)
    process.exit(0)

  } catch (err) {
    console.error('\nFailed to send announcement:', err)
    process.exit(1)
  }
}

main()
