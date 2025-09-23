import { writable } from 'svelte/store';
import { Language } from '$lib/constants/language';
import { type LanguageData } from '$lib/interfaces/languageData';
import { isBrowser } from '$lib/constants/isBrowser';

/**
 * Safely parse localStorage data with error handling
 * @returns Parsed language data or an empty object if parsing fails
 */
function getInitialData(): Record<Language, LanguageData> {
	const empty = {} as Record<Language, LanguageData>;
	if (!isBrowser) {
		return empty;
	}

	try {
		const storedData = localStorage.getItem('languageData');
		if (!storedData) {
			return empty;
		}
		const parsed = JSON.parse(storedData);
		if (parsed && typeof parsed === 'object') {
			return parsed as Record<Language, LanguageData>;
		}
		console.warn('Invalid languageData format in localStorage, returning empty object');
		return empty;
	} catch (error) {
		console.error('Failed to parse languageData from localStorage:', error);
		return empty;
	}
}

/**
 * A writable store holding the language data for each language, which is persisted in the browser's localStorage.
 */
const languageData = writable<Record<Language, LanguageData>>(getInitialData());

// Only persist to localStorage on the client side.
if (isBrowser) {
	languageData.subscribe((value) => {
		try {
			localStorage.setItem('languageData', JSON.stringify(value));
		} catch (error) {
			console.error('Failed to save languageData to localStorage:', error);
		}
	});
}

export { languageData };
