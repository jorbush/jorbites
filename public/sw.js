self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png', // Using the same icon for badge for now
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url,
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  const urlToOpen = event.notification.data.url || '/'
  const absoluteUrl = new URL(urlToOpen, self.location.origin).href
  event.waitUntil(clients.openWindow(absoluteUrl))
})
