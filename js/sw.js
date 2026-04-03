const CACHE_NAME = 'v1-doc';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/documentation.html',
  '/script.js',
  '/manifest.json'
  // Ajouter les fichiers CSS ou autres JS ici
];

// Événement d'installation : mise en cache dès le premier accès
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Mise en cache des ressources (Lot 3)');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Événement de récupération (Fetch) : Stratégie Cache-First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si le fichier est dans le cache, on le retourne directement
        if (response) {
          return response;
        }
        // Sinon, on fait une requête réseau
        return fetch(event.request);
      })
  );
});
