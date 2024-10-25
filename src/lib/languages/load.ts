import { init, register, locale as $locale } from 'svelte-i18n';
import { base } from '$app/paths';
import { writable } from 'svelte/store';
import { Language } from '$lib/languages/language';
import { type Card } from '$lib/interfaces/card';
import { seededShuffle } from '$lib/utils/seed';

interface LanguageData {
	cards?: Card[];
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
			fetchFn(`${base}/cards/finnish.json`).then((res) => res.json()),
			fetchFn(`${base}/cards/english.json`).then((res) => res.json())
		]);

		const seed = Math.random();
		const fiShuffledCards = seededShuffle(fiCards.cards, seed);
		const enShuffledCards = seededShuffle(enCards.cards, seed);

		languageData.set({
			[Language.FI]: { cards: fiShuffledCards.slice(0, cardAmount) },
			[Language.EN]: { cards: enShuffledCards.slice(0, cardAmount) }
		});

		return Math.min(fiCards.cards.length, enCards.cards.length);
	} catch (error) {
		console.error('Failed to preload languages: ', error);
		return 0;
	}
}

export async function setLanguage(lang: Language) {
	const localeCode = lang.toString();
	if (localeCode) {
		await $locale.set(localeCode);
	} else {
		console.error(`Unsupported language: ${lang}`);
	}
}
