const CACHE_NAME = 'acurescan-v1'
const urlsToCache = ['/', '/index.html', '/app.bundle.js']

self.addEventListener('install', event => {
    // Skip caching selama development
    if (process.env.NODE_ENV !== 'production') {
        return self.skipWaiting()
    }

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache')
            return cache.addAll(urlsToCache)
        })
    )
    self.skipWaiting()
})

self.addEventListener('fetch', event => {
    // Skip caching selama development
    if (process.env.NODE_ENV !== 'production') {
        return
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response
            }
            return fetch(event.request)
        })
    )
})

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME]
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName)
                    }
                    return null
                })
            )
        })
    )
    event.waitUntil(clients.claim())
})
