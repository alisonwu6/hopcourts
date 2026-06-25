self.addEventListener('push', function (event) {
  if (!event.data) return
  const payload = event.data.json()
  event.waitUntil(
    self.registration.showNotification(payload.title || 'HopCourts', {
      body: payload.body || '',
      icon: '/apple-touch-icon.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: { url: payload.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const target = event.notification.data.url
      for (const client of clientList) {
        if (client.url === target && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(target)
    })
  )
})
