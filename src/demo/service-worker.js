self.addEventListener('install', (event) => {
    console.log('SW installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('SW activated');
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request);
});
