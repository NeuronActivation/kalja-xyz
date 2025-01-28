import type { LoadEvent } from '@sveltejs/kit';
import { waitLocale } from 'svelte-i18n';
import { registerLocales } from '$lib/languages/load';

export async function load({ fetch }: LoadEvent) {
	registerLocales(fetch);
	await waitLocale();
	return {};
}

// This can be false if you're using a fallback (i.e. SPA mode)
export const prerender = true;
