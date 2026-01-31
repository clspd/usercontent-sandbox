const CACHE_NAME = 'usercontent_storage_v1';
const hostOrigin = globalThis.location.origin;

globalThis.addEventListener('install', (event) => {
    event.waitUntil(globalThis.skipWaiting());
});

globalThis.addEventListener('activate', (event) => {

});

globalThis.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    if (url.origin === hostOrigin && url.pathname === '/__/_/_w' && req.method === 'GET') {
        event.respondWith(new Response(new Blob(['true'], { type: 'text/plain' }), { status: 200 }));
        return;
    }

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

