/**
 * A module to manage language and card data, handle locale registration,
 * and interact with the Svelte i18n library.
 */

import { init, getLocaleFromNavigator, register, locale as $locale } from 'svelte-i18n';
import { writable, get } from 'svelte/store';
import { base } from '$app/paths';
import { getCardUrl, Language } from '$lib/languages/language';
import { type Card } from '$lib/interfaces/card';
import { seededShuffle } from '$lib/utils/seed';
import { isBrowser } from '$lib/constants/isBrowser';

/**
 * Represents the data associated with a language, including the cards and language code.
 */
interface LanguageData {
	cards?: Card[];
	language: Language;
}

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

/**
 * Registers locales for the application, making them available to the Svelte i18n library.
 */
export function registerLocales(fetchFn: typeof fetch) {
	register('fi', () => fetchFn(`${base}/locales/finnish.json`).then((res) => res.json()));
	register('en', () => fetchFn(`${base}/locales/english.json`).then((res) => res.json()));
}

/**
 * Initializes the Svelte i18n library with a fallback locale and an initial locale.
 */
init({
	fallbackLocale: 'en',
	initialLocale: getLocaleFromNavigator()?.split('-')[0]
});

/**
 * Creates the card data for each language, shuffling them with a seeded random generator.
 * @param cardAmount The number of cards to retrieve for each language.
 * @returns A record of shuffled card data for each language or null if fetching fails.
 */
async function createCards(cardAmount: number): Promise<Record<Language, LanguageData> | null> {
	try {
		const [fiCards, enCards] = await Promise.all([
			fetch(getCardUrl(Language.FI)).then((res) => res.json()),
			fetch(getCardUrl(Language.EN)).then((res) => res.json())
		]);

		const seed = Math.random();
		const fiShuffledCards = seededShuffle(fiCards.cards, seed);
		const enShuffledCards = seededShuffle(enCards.cards, seed);

		return {
			[Language.FI]: { cards: fiShuffledCards.slice(0, cardAmount), language: Language.FI },
			[Language.EN]: { cards: enShuffledCards.slice(0, cardAmount), language: Language.EN }
		};
	} catch (error) {
		console.error('Failed to preload languages: ', error);
		return null;
	}
}

/**
 * Loads card data for all supported languages and stores it in the languageData store.
 * @returns The number of cards available across all languages.
 */
export async function loadCards(): Promise<number> {
	try {
		const cardsData = await createCards(Number.MAX_SAFE_INTEGER);
		if (!cardsData) {
			return 0;
		}

		languageData.set(cardsData);

		// Get the minimum length of all languages.
		return (
			Object.values(cardsData)
				.map((lang) => lang.cards?.length ?? 0)
				.reduce((min, length) => Math.min(min, length), Number.MAX_SAFE_INTEGER) || 0
		);
	} catch (error) {
		console.error('Failed to preload languages: ', error);
		return 0;
	}
}

/**
 * Loads a single card and updates the data for all languages, replacing the card at the specified index.
 * @param cardIndex The index of the card to be replaced.
 */
export async function loadSingleCard(cardIndex: number): Promise<void> {
	try {
		const currentData = get(languageData);
		if (!currentData) return;

		// Fetch a new single card for each language.
		const newCardData = await createCards(1);
		if (!newCardData) return;

		const updatedData: Record<Language, LanguageData> = { ...currentData };

		// Replace the card at cardIndex for each language.
		for (const lang of Object.values(Language)) {
			const langData = updatedData[lang];
			const newLangCard = newCardData[lang]?.cards?.[0];

			if (langData?.cards && newLangCard) {
				langData.cards[cardIndex] = newLangCard;
			}

			updatedData[lang] = { ...langData, language: lang };
		}

		languageData.set(updatedData);
	} catch (error) {
		console.error('Failed to load a single card:', error);
	}
}

/**
 * Retrieves the stored cards for a given language.
 * @param lang The language for which to retrieve the cards.
 * @returns An array of cards for the specified language, or null if no cards are stored.
 */
export function getStoredCards(lang: Language): Card[] | null {
	return get(languageData)[lang]?.cards || null;
}

/**
 * Retrieves the stored language from sessionStorage.
 * @returns The selected language code, or the fallback language (EN) if no selection exists.
 */
export function getStoredLanguage(): Language {
	const storedLanguage = sessionStorage.getItem('selectedLanguage');
	if (storedLanguage) {
		return storedLanguage as Language;
	}
	// Normalize navigator locale.
	const detectedLocale = getLocaleFromNavigator()?.split('-')[0] as Language;

	// Ensure detectedLocale is a valid Language, otherwise default to English.
	return Object.values(Language).includes(detectedLocale) ? detectedLocale : Language.EN;
}

/**
 * Sets the application's language by updating sessionStorage and the Svelte i18n locale.
 * @param lang The language to set.
 */
export async function setLanguage(lang: Language) {
	const localeCode = lang.toString();
	if (localeCode) {
		sessionStorage.setItem('selectedLanguage', lang);
		await $locale.set(localeCode);
	} else {
		console.error(`Unsupported language: ${lang}`);
	}
}
