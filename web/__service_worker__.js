const CACHE_NAME = 'usercontent_storage_v1';
const hostOrigin = globalThis.location.origin;

globalThis.addEventListener('install', (event) => {
    console.log('[sw] install');
    event.waitUntil(globalThis.skipWaiting());
});

globalThis.addEventListener('activate', (event) => {
    console.log('[sw] activate');
});

globalThis.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    if (url.origin === hostOrigin && url.pathname === '/__/_/_w' && req.method === 'GET') {
        event.respondWith(new Response(new Blob(['true'], { type: 'text/plain' }), { status: 200 }));
        return;
    }

    if (url.origin === hostOrigin && url.pathname.startsWith('/__/_c/')) {
        event.respondWith((async () => {
            if (req.method === 'DELETE' && url.pathname === '/__/_c/') {
                await caches.delete(CACHE_NAME); // clear all files
                return new Response(null, { status: 204 });
            }
            const cache = await caches.open(CACHE_NAME);
            const action = req.method;
            if (action === 'GET') {
                const resp = await cache.match(req);
                return resp ?? new Response(null, { status: 404 });
            }
            if (action === 'PUT') {
                const cachePath = url.pathname.substring(6); // remove '/__/_c' prefix, keep the end /
                await cache.put(req, new Response(req.body, {
                    headers: {
                        'Content-Type': req.headers.get('Content-Type'),
                    }
                }));
                return new Response(null, { status: 204 });
            }
            if (action === 'DELETE') {
                await cache.delete(req);
                return new Response(null, { status: 204 });
            }
            return new Response(null, { status: 400 });
        })());
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

