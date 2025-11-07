// service-worker.js

const CACHE_NAME = "black-horse-wash-v2";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "image/logo.jpg",
  "image/CarWash.jpg",
  "image/abonnement-basic.jpg",
  "image/abonnement-medium.jpg",
  "image/abonnement-premium.jpg",
  "image/avance.jpg",
  "image/exterieur-voiture.jpg",
  "image/interieur-voiture.jpg",
  "image/lavage-les-2.jpg",
  "image/lustrant-voiture.jpg",
  "image/maps.jpg",
  "image/micro-fibre.jpg",
  "image/Profil.jpg",
  "image/RDV.jpg",
  "image/Service.jpg",
  "image/shampoo-car.jpg"
];

// Installer et pré-cacher tous les fichiers
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activer et supprimer les anciens caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Intercepter toutes les requêtes
self.addEventListener("fetch", event => {
  // For navigation requests (HTML pages), prefer network first so users get updates quickly
  if (event.request.mode === 'navigate' || (event.request.destination && event.request.destination === 'document')) {
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        // Save a copy in the cache for offline use
        if (networkResponse && networkResponse.status === 200) {
          const respClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
        }
        return networkResponse;
      }).catch(() => {
        // If network fails, try cache fallback (index.html)
        return caches.match('index.html');
      })
    );
    return;
  }

  // For other requests (images, css, js), use cache-first then network and update cache
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return networkResponse;
      }).catch(() => {
        // fallback pour les images
        if (event.request.destination === 'image') {
          return caches.match('image/logo.jpg');
        }
      });
    })
  );
});