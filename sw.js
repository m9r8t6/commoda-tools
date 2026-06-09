// Ein simpler Service Worker, der das Installieren der PWA erlaubt,
// aber IMMER die Live-Daten aus dem Netz holt (kein hartes Caching).

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Zwingt den Browser, Updates sofort zu übernehmen
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Holt bei jedem Aufruf die frischeste Version vom Server
    event.respondWith(fetch(event.request));
});