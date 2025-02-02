import { waitLocale } from 'svelte-i18n';
import { registerLocales } from '$lib/languages/load';

/**
 * This function ensures that the necessary locale data is loaded and available before the
 * page is rendered, which is important for multi-language support.
 */
export async function load() {
	registerLocales();
	await waitLocale();
	return {};
}

// This can be false if you're using a fallback (i.e. SPA mode)
export const prerender = true;
