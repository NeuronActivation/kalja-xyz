import { waitLocale } from 'svelte-i18n';
import { registerLocales } from '$lib/i18n/index';

/**
 * This function ensures that the necessary locale data is loaded and available before the
 * page is rendered, which is important for multi-language support.
 */
export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	registerLocales(fetch);
	await waitLocale();
	return {};
}

// This can be false if you're using a fallback (i.e. SPA mode)
export const prerender = true;
