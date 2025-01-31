import { writable } from 'svelte/store';
import { Language } from '$lib/languages/language';
import { getStoredCards, setLanguage, getStoredLanguage } from '$lib/languages/load';
import { isBrowser } from '$lib/constants/isBrowser';

function createLanguageStore() {
	const { subscribe, set } = writable({
		language: Language.FI
	});

	let onInitComplete: (() => void) | null = null;

	// Ensure that the store updates once the client-side JavaScript takes over.
	async function initialize() {
		if (isBrowser) {
			const storedLanguage = getStoredLanguage();

			await setLanguage(storedLanguage);
			set({ language: storedLanguage });
		}
	}
	initialize();

	return {
		subscribe,
		async changeLanguage(newLanguage: Language) {
			await setLanguage(newLanguage);

			set({ language: newLanguage });
			if (onInitComplete) {
				onInitComplete();
			}
		},
		async getCards() {
			const currentLanguage = getStoredLanguage();
			const cards = getStoredCards(currentLanguage);
			return cards || [];
		},
		setGameStoreUpdate(cb: () => void) {
			onInitComplete = cb;
		}
	};
}

export const languageStore = createLanguageStore();
