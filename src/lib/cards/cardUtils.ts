import { get } from 'svelte/store';
import { Language } from '$lib/constants/language';
import { type LanguageSpecificCard } from '$lib/interfaces/card';
import { languageData } from '$lib/stores/languageData';

/**
 * Retrieves the stored cards for a given language.
 * @param lang The language for which to retrieve the cards.
 * @returns An array of cards for the specified language, or null if no cards are stored.
 */
export function getStoredCards(lang: Language): LanguageSpecificCard[] | null {
	return get(languageData)[lang]?.cards || null;
}
