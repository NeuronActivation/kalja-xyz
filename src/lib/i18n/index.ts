import { init, getLocaleFromNavigator, register } from 'svelte-i18n';
import { base } from '$app/paths';

/**
 * Registers locales for the application, making them available to the Svelte i18n library.
 * @param fetchFn The fetch function to load locale files.
 */
export function registerLocales(fetchFn: typeof fetch) {
	register('fi', () => fetchFn(`${base}/locales/finnish.json`).then((res) => res.json()));
	register('en', () => fetchFn(`${base}/locales/english.json`).then((res) => res.json()));
}

// Initialize Svelte i18n with fallback locale
init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator()?.split('-')[0]
});
