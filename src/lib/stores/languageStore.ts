import { writable } from 'svelte/store';
import { Language } from '$lib/languages/language';
import { getStoredCards, setLanguage, getStoredLanguage } from '$lib/languages/load';

function createLanguageStore() {
	const { subscribe, set } = writable({
		language: Language.FI
	});

	let onInitComplete: (() => void) | null = null;

	// Ensure that the store updates once the client-side JavaScript takes over.
	async function initialize() {
		if (typeof window !== 'undefined') {
			const storedLanguage = getStoredLanguage();
			const storedCards = getStoredCards(storedLanguage);

			if (!storedCards) {
				console.error('Stored cards do not exist');
				return;
			}

			await setLanguage(storedLanguage);
			set({ language: storedLanguage });

			// If gameStore is available, update it.
			if (onInitComplete) {
				onInitComplete();
			}
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
