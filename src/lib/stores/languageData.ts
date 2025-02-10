import { writable } from 'svelte/store';
import { Language } from '$lib/constants/language';
import { type LanguageData } from '$lib/interfaces/languageData';
import { isBrowser } from '$lib/constants/isBrowser';

/**
 * A writable store holding the language data for each language, which is persisted in the browser's localStorage.
 */
const languageData = writable<Record<Language, LanguageData>>(
	isBrowser ? JSON.parse(localStorage.getItem('languageData') || '{}') : {}
);

// Only persist to localStorage on the client side.
if (isBrowser) {
	languageData.subscribe((value) => {
		localStorage.setItem('languageData', JSON.stringify(value));
	});
}

export { languageData };
