import { base } from '$app/paths';
import { getLocaleFromNavigator, init, register } from 'svelte-i18n';
import { isBrowser } from '$lib/constants/isBrowser';

/**
 * The part of the fetch API that the locale loaders actually rely on.
 * Deliberately narrower than `typeof fetch` so that locale loading can be
 * stubbed with a plain function in tests. The global `fetch` satisfies it.
 */
export type LocaleFetch = (path: string) => Promise<{ json: () => Promise<unknown> }>;

/**
 * Registers locales for the application, making them available to the Svelte i18n library.
 * @param fetchFn The fetch function to load locale files.
 */
export function registerLocales(fetchFn: LocaleFetch) {
	register('fi', () => fetchFn(`${base}/locales/finnish.json`).then((res) => res.json()));
	register('en', () => fetchFn(`${base}/locales/english.json`).then((res) => res.json()));
}

// The prerendered page has no navigator, so it is rendered in Finnish to match the page's
// Finnish metadata. In the browser the visitor's own language is used.
init({
	fallbackLocale: 'en',
	initialLocale: isBrowser ? getLocaleFromNavigator()?.split('-')[0] : 'fi',
});
