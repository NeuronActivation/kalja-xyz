/**
 * Service worker for offline functionality and asset caching.
 * @module ServiceWorker
 * @see {@link https://kit.svelte.dev/docs/service-workers SvelteKit Service Workers}
 */

import { build, files, version } from '$service-worker';

const CACHE = `kalja-xyz-cache-${version}`;

/**
 * Core assets required for the app to function offline.
 * @description Includes:
 * - Built JS/CSS assets (`build`)
 * - Static files from `static` directory (`files`)
 * - Additional runtime assets (manifest, etc.)
 */
const ASSETS: string[] = [
	...build, // Compiled application code
	...files // Static assets
];

// Service worker lifecycle event handlers

/**
 * Handles installation event for service worker.
 * Caches core assets during install phase.
 * @event install
 */
self.addEventListener('install', (event: ExtendableEvent) => {
	/**
	 * Cache core application assets during installation.
	 * Uses waitUntil to extend service worker lifecycle.
	 */
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

/**
 * Handles activation event for service worker.
 * Cleans up old cache versions during activation.
 * @event activate
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
	/**
	 * Remove outdated caches to free storage space.
	 * Preserves only current version's cache.
	 */
	async function deleteOldCaches() {
		const keys = await caches.keys();
		await Promise.all(keys.map((key) => key !== CACHE && caches.delete(key)));
	}

	event.waitUntil(deleteOldCaches());
});

/**
 * Handles fetch events with cache-first strategy for core assets
 * and network-first with cache fallback for other requests.
 * @event fetch
 */
self.addEventListener('fetch', (event: FetchEvent) => {
	// Skip non-GET requests and browser extensions
	if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension:')) return;

	/**
	 * Core fetch handler implementing caching strategies:
	 * - Cache-first for known assets
	 * - Network-first with cache fallback for other requests
	 */
	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// Cache-first for core assets
		if (ASSETS.includes(url.pathname)) {
			const cached = await cache.match(url.pathname);
			if (cached) return cached;
		}

		try {
			const response = await fetch(event.request);

			// Validate successful response before caching
			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			// Network failure: attempt cache fallback
			const cached = await cache.match(event.request);
			return cached || Promise.reject(err);
		}
	}

	event.respondWith(respond());
});
