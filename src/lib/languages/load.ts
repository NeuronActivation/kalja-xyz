/**
 * A module to manage language and card data, handle locale registration,
 * and interact with the Svelte i18n library.
 */

import { init, register, locale as $locale } from 'svelte-i18n';
import { writable, get } from 'svelte/store';
import { base } from '$app/paths';
import { getCardUrl, Language } from '$lib/languages/language';
import { type Card } from '$lib/interfaces/card';
import { seededShuffle } from '$lib/utils/seed';
import { isBrowser } from '$lib/constants/isBrowser';
import { Tag } from '$lib/constants/tag';

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
 * @param fetchFn The fetch function to load locale files.
 */
export function registerLocales(fetchFn: typeof fetch) {
	register('fi', () => fetchFn(`${base}/locales/finnish.json`).then((res) => res.json()));
	register('en', () => fetchFn(`${base}/locales/english.json`).then((res) => res.json()));
}

/**
 * Initializes the Svelte i18n library with a fallback locale and an initial locale.
 */
init({
	fallbackLocale: 'fi',
	initialLocale: 'fi'
});

/**
 * Fetches, tags, filters and shuffles cards for a given language.
 * @param language The language to fetch cards for.
 * @param tags The tags to filter by.
 * @param seed The seed for shuffling.
 * @returns Shuffled and filtered cards for the given language.
 */
async function fetchAndFilterCards(language: Language, tags: Tag[], seed: number): Promise<Card[]> {
	try {
		const response = await fetch(getCardUrl(language));
		const { cards } = await response.json();
		const taggedCards = await createTags(cards);

		// Filter only cards that contain at least one of the given tags.
		const filteredCards = taggedCards.filter(
			(card) => Array.isArray(card.tags) && card.tags.some((tag) => tags.includes(tag))
		);
		return seededShuffle(filteredCards, seed);
	} catch (error) {
		console.error(`Failed to fetch cards for language ${language}:`, error);
		return [];
	}
}

/**
 * Creates the card data for each language, shuffling them with a seeded random generator.
 * @param cardAmount The number of cards to retrieve for each language.
 * @param tags The tags that a card must contain at least one of.
 * @returns A record of shuffled card data for each language or null if fetching fails.
 */
async function createCards(
	cardAmount: number,
	tags: Tag[]
): Promise<Record<Language, LanguageData> | null> {
	try {
		const seed = Math.random();

		const [fiShuffledCards, enShuffledCards] = await Promise.all([
			fetchAndFilterCards(Language.FI, tags, seed),
			fetchAndFilterCards(Language.EN, tags, seed)
		]);

		return {
			[Language.FI]: { cards: fiShuffledCards.slice(0, cardAmount), language: Language.FI },
			[Language.EN]: { cards: enShuffledCards.slice(0, cardAmount), language: Language.EN }
		};
	} catch (error) {
		console.error('Failed to create cards:', error);
		return null;
	}
}

/**
 * Maps cards with tag data based on their id.
 * @param cards The list of cards to process.
 * @returns A new array of cards with added tag information.
 */
async function createTags(cards: Card[]): Promise<Card[]> {
	const tagData = await fetch(`${base}/tags/tags.json`).then((res) => res.json());
	return cards.map((card) => ({
		...card,
		tags: tagData.tags[card.id] || []
	}));
}

/**
 * Loads card data for all supported languages and stores it in the languageData store.
 * @param tags The tags that a card must contain at least one of.
 * @returns The number of cards available across all languages.
 */
export async function loadCards(tags: Tag[]): Promise<number> {
	try {
		const cardsData = await createCards(Number.MAX_SAFE_INTEGER, tags);
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
 * @param tags The tags that the card must contain at least one of.
 */
export async function loadSingleCard(cardIndex: number, tags: Tag[]): Promise<void> {
	try {
		const currentData = get(languageData);
		if (!currentData) return;

		// Fetch a new single card for each language.
		const newCardData = await createCards(1, tags);
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
 * @returns The selected language code, or the fallback language (FI) if no selection exists.
 */
export function getStoredLanguage(): Language {
	const storedLanguage = sessionStorage.getItem('selectedLanguage');
	if (storedLanguage) {
		return storedLanguage as Language;
	}
	return Language.FI;
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
