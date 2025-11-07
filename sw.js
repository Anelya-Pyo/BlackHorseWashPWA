// service-worker.js

const CACHE_NAME = "black-horse-wash-v1";
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