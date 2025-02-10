import { type Invalidator, type Subscriber, type Unsubscriber } from 'svelte/motion';
import { writable } from 'svelte/store';
import { type LanguageSpecificCard } from '$lib/interfaces/card';
import { Language } from '$lib/constants/language';
import { isBrowser } from '$lib/constants/isBrowser';
import { getStoredLanguage } from '$lib/i18n/localeStorage';
import { getStoredCards } from '$lib/cards/cardUtils';
import { setLanguage } from '$lib/i18n/localeStorage';

interface LanguageStore {
	/**
	 * Subscribes to language store updates.
	 *
	 * @param run - The function to run when the store's value changes.
	 * @param invalidate - Optional function to invalidate the store's value.
	 *
	 * @returns An unsubscribe function to stop receiving updates.
	 */
	subscribe: (
		run: Subscriber<{ language: Language }>,
		invalidate?: Invalidator<{ language: Language }> | undefined,
	) => Unsubscriber;

	/**
	 * Changes the current language and updates the store.
	 *
	 * @param newLanguage - The language to switch to.
	 * @returns A promise that resolves when the language change is complete.
	 */
	changeLanguage(newLanguage: Language): Promise<void>;

	/**
	 * Retrieves the cards available for the current language.
	 *
	 * @returns A promise that resolves to an array of language specific cards or null if no cards are found.
	 */
	getCards(): LanguageSpecificCard[] | null;

	/**
	 * Sets a callback function to be executed once the store initialization is complete.
	 *
	 * @param cb - The callback function to call once initialization is done.
	 */
	setGameStoreUpdate(cb: () => void): void;
}

/**
 * Creates a writable store for managing language settings.
 * Initializes the store with the stored language (if available) or defaults to Finnish.
 * The store handles language changes and provides access to cards in the current language.
 *
 * @returns {LanguageStore} The language store with methods to change language, get cards, and set game store updates.
 */
function createLanguageStore(): LanguageStore {
	const { subscribe, set } = writable({
		language: Language.FI,
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
		getCards(): LanguageSpecificCard[] | null {
			const currentLanguage = getStoredLanguage();
			return getStoredCards(currentLanguage);
		},
		setGameStoreUpdate(cb: () => void) {
			onInitComplete = cb;
		},
	};
}

export const languageStore = createLanguageStore();
