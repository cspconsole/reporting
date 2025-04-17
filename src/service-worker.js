self.addEventListener('install', (event) => {
    console.log('SW installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('SW activated');
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    event.respondWith(
        (async () => {
            const response = await fetch(request.clone());
            const responseClone = response.clone();
            const contentType = responseClone.headers.get('Content-Type');
            const contentLength = responseClone.headers.get('Content-Length');

            const method = request.method.toUpperCase();

            if (method !== 'GET') {
                return response;
            }

            const clientsList = await self.clients.matchAll();
            for (const client of clientsList) {
                client.postMessage({
                    type: 'ASSET_FETCHED',
                    url: request.url,
                    method: method,
                    headers: Object.fromEntries(request.headers.entries()),
                    status: response.status,
                    statusText: response.statusText,
                    contentType,
                    contentLength,
                    time: new Date().toISOString(),
                });
            }

            return response;
        })()
    );
});
