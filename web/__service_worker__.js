const CACHE_NAME = 'usercontent_storage_v1';

globalThis.addEventListener('install', (event) => {
    event.waitUntil(globalThis.skipWaiting());
});

globalThis.addEventListener('activate', (event) => {

});

globalThis.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    if (url.pathname.startsWith('/__/')) {
        event.respondWith(fetch(req));
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const resp = await cache.match(req);
        return resp ?? fetch(req);
    })());
});

