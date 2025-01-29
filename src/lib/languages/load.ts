import { init, register, locale as $locale } from 'svelte-i18n';
import { writable } from 'svelte/store';
import { base } from '$app/paths';
import { getCardUrl, Language } from '$lib/languages/language';
import { type Card } from '$lib/interfaces/card';
import { seededShuffle } from '$lib/utils/seed';

interface LanguageData {
	cards?: Card[];
	language: Language;
}

export const languageData = writable<Record<Language, LanguageData>>();

// Register locales
export function registerLocales(fetchFn: typeof fetch) {
	register('fi', () => fetchFn(`${base}/locales/finnish.json`).then((res) => res.json()));
	register('en', () => fetchFn(`${base}/locales/english.json`).then((res) => res.json()));
}

// Initialize svelte-i18n
init({
	fallbackLocale: 'fi',
	initialLocale: 'fi'
});

// Load all the data from language JSON files. Returns the total number of available cards
export async function loadCards(fetchFn: typeof fetch, cardAmount: number): Promise<number> {
	try {
		const [fiCards, enCards] = await Promise.all([
			fetchFn(getCardUrl(Language.FI)).then((res) => res.json()),
			fetchFn(getCardUrl(Language.EN)).then((res) => res.json())
		]);

		const seed = Math.random();
		const fiShuffledCards = seededShuffle(fiCards.cards, seed);
		const enShuffledCards = seededShuffle(enCards.cards, seed);

		const cardsData = {
			[Language.FI]: { cards: fiShuffledCards.slice(0, cardAmount), language: Language.FI },
			[Language.EN]: { cards: enShuffledCards.slice(0, cardAmount), language: Language.EN }
		};

		sessionStorage.setItem('languageData', JSON.stringify(cardsData));
		languageData.set(cardsData);

		return Math.min(fiCards.cards.length, enCards.cards.length);
	} catch (error) {
		console.error('Failed to preload languages: ', error);
		return 0;
	}
}

// Load a new single card and update the languageData.
export async function loadSingleCard(fetchFn: typeof fetch, cardIndex: number): Promise<void> {
	try {
		const languageUrls = {
			[Language.FI]: getCardUrl(Language.FI),
			[Language.EN]: getCardUrl(Language.EN)
		};
		const seed = Math.random();

		// Fetch and shuffle one card for each language using the same seed.
		const languageEntries = await Promise.all(
			(Object.entries(languageUrls) as [Language, string][]).map(async ([lang, url]) => {
				const response = await fetchFn(url);
				const data = await response.json();

				const shuffledCards = seededShuffle(data.cards, seed);
				const newCard = shuffledCards[0];

				return [lang, newCard] as const;
			})
		);

		// Update languageData for all languages at the given index.
		languageData.update((currentData) => {
			const updatedData = { ...currentData };

			languageEntries.forEach(([lang, newCard]) => {
				const updatedCards = [...(updatedData[lang]?.cards || [])];

				// Ensure the index exists before replacing the card.
				if (updatedCards.length > cardIndex) {
					updatedCards[cardIndex] = newCard;
				}

				updatedData[lang] = {
					cards: updatedCards,
					language: lang
				};
			});

			// Update sessionStorage to keep it in sync.
			sessionStorage.setItem('languageData', JSON.stringify(updatedData));

			return updatedData;
		});
	} catch (error) {
		console.error('Failed to load a single card:', error);
	}
}

export function getStoredCards(lang: Language): Card[] | null {
	const storedData = sessionStorage.getItem('languageData');

	if (storedData) {
		// Parse the data into the expected type.
		const parsedData: Record<Language, { cards: Card[] }> = JSON.parse(storedData);

		const languageData = parsedData[lang];
		if (languageData) {
			return languageData.cards;
		}
	}

	console.warn(`Cards uninitialized for lang: ${lang}`);
	return null;
}

export function getStoredLanguage(): Language {
	const storedLanguage = sessionStorage.getItem('selectedLanguage');
	if (storedLanguage) {
		return storedLanguage as Language;
	}
	return Language.FI;
}

export async function setLanguage(lang: Language) {
	const localeCode = lang.toString();
	if (localeCode) {
		sessionStorage.setItem('selectedLanguage', lang);
		await $locale.set(localeCode);
	} else {
		console.error(`Unsupported language: ${lang}`);
	}
}
