import { init, register, locale as $locale } from 'svelte-i18n';
import { writable, get } from 'svelte/store';
import { base } from '$app/paths';
import { getCardUrl, Language } from '$lib/languages/language';
import { type Card } from '$lib/interfaces/card';
import { seededShuffle } from '$lib/utils/seed';
import { isBrowser } from '$lib/constants/isBrowser';

interface LanguageData {
	cards?: Card[];
	language: Language;
}

const storedData = isBrowser ? localStorage.getItem('languageData') : null;
const languageData = writable<Record<Language, LanguageData>>(
	storedData ? JSON.parse(storedData) : {}
);

// Only persist to localStorage on the client side.
if (isBrowser) {
	languageData.subscribe((value) => {
		localStorage.setItem('languageData', JSON.stringify(value));
	});
}

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

async function createCards(
	fetchFn: typeof fetch,
	cardAmount: number
): Promise<Record<Language, LanguageData> | null> {
	try {
		const [fiCards, enCards] = await Promise.all([
			fetchFn(getCardUrl(Language.FI)).then((res) => res.json()),
			fetchFn(getCardUrl(Language.EN)).then((res) => res.json())
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

export async function loadCards(fetchFn: typeof fetch, cardAmount: number): Promise<number> {
	try {
		const cardsData = await createCards(fetchFn, cardAmount);
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

export async function loadSingleCard(fetchFn: typeof fetch, cardIndex: number): Promise<void> {
	try {
		const currentData = get(languageData);
		if (!currentData) return;

		// Fetch a new single card for each language.
		const newCardData = await createCards(fetchFn, 1);
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

export function getStoredCards(lang: Language): Card[] | null {
	return get(languageData)[lang]?.cards || null;
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
