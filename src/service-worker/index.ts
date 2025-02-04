import { build, files, version } from '$service-worker';

const CACHE = `kalja-xyz-cache-${version}`;
const ASSETS: string[] = [
    ...build, // the app itself
    ...files  // everything in `static`
];

self.addEventListener('install', (event: ExtendableEvent) => {
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event: FetchEvent) => {
    if (event.request.method !== 'GET') return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        if (ASSETS.includes(url.pathname)) {
            const response = await cache.match(url.pathname);
            if (response) return response;
        }

        try {
            const response = await fetch(event.request);

            if (!(response instanceof Response)) {
                throw new Error('Invalid response from fetch');
            }

            if (response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch (err) {
            const response = await cache.match(event.request);
            if (response) return response;
            throw err;
        }
    }

    event.respondWith(respond());
});
