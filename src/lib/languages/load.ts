import { base } from '$app/paths';
import { writable } from 'svelte/store';
import { Language } from '$lib/languages/language';
import { type Card } from '$lib/models/card';
import { cardsInGame } from '$lib/constants/cardsInGame';

interface LocaleData {
	[key: string]: string;
}

interface LanguageData {
	locale: LocaleData;
	cards?: Card[];
}

export const languageData = writable<Record<Language, LanguageData>>();

// Load all the data from language JSON files.
export async function loadLanguages() {
	try {
		const [fiLocale, enLocale] = await Promise.all([
			fetch(`${base}/locales/finnish.json`).then((res) => res.json()),
			fetch(`${base}/locales/english.json`).then((res) => res.json())
		]);

		const [fiCards, enCards] = await Promise.all([
			fetch(`${base}/cards/finnish.json`).then((res) => res.json()),
			fetch(`${base}/cards/english.json`).then((res) => res.json())
		]);

		const seed = Math.random();
		const fiFixedCards = seededShuffle(fiCards.cards.slice(0, cardsInGame), seed);
		const enFixedCards = seededShuffle(enCards.cards.slice(0, cardsInGame), seed);

		languageData.set({
			[Language.FI]: { locale: fiLocale, cards: fiFixedCards },
			[Language.EN]: { locale: enLocale, cards: enFixedCards }
		});
	} catch (error) {
		console.error('Failed to preload languages: ', error);
	}
}

// Seeded random number generator using a linear congruential generator (LCG).
function seededRandom(seed: number): () => number {
	// Ensure the seed is a positive number between 1 and 2147483646.
	let s = seed % 2147483647;

	// Adjust seed if non-positive.
	if (s <= 0) s += 2147483646;

	// Return a function that generates pseudorandom numbers.
	return () => {
		// Advance the internal state using the LCG formula: s = (s * 16807) % 2147483647.
		s = (s * 16807) % 2147483647;

		// Normalize the result to a floating-point number in the range [0, 1].
		return (s - 1) / 2147483646;
	};
}

// Seeded shuffle function
function seededShuffle(array: Card[], seed: number): Card[] {
	const random = seededRandom(seed);

	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
